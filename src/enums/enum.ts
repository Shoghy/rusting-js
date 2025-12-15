/* eslint-disable @typescript-eslint/ban-ts-comment */
import { panic } from "../panic.ts";

/**
 * A generic abstract base class for building type–value–tagged enums.
 *
 * `EnumClass` stores a discriminant (`type`) and an associated value,
 * and provides pattern-matching and utility helpers for safe access
 * and transformation.
 *
 * @template Schema An object whose keys represent variant names and whose
 * values represent the associated data type of each variant.
 */
export abstract class EnumClass<Schema extends object> {
  #type: keyof Schema;
  #value: Schema[keyof Schema];

  /**
   * Constructs a new enum instance.
   * @throws If {@link isValidTypeValue} returns `false`.
   * @protected
   */
  protected constructor(type: keyof Schema, value: Schema[keyof Schema]) {
    if (!this.isValidTypeValue(type, value)) {
      panic("Invalid type");
    }
    this.#type = type;
    this.#value = value;
  }

  /**
   * Validates whether the provided type/value pair is allowed.
   * Override this in subclasses to enforce invariants.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isValidTypeValue(type: keyof Schema, value: Schema[keyof Schema]) {
    return true;
  }

  /**
   * Calls the provided function only if the current type matches `type`.
   */
  ifIs<T extends keyof Schema>(type: T, func: (value: Schema[T]) => void) {
    if (type !== this.#type) return;
    func(this.#value as Schema[T]);
  }

  /**
   * Pattern-matches against all possible variants.
   */
  match<T>(arms: { [K in keyof Schema]: (value: Schema[K]) => T }): T;
  /**
   * Pattern-matches against variants, with an optional default branch.
   */
  match<T>(
    arms: { [K in keyof Schema]?: (value: Schema[K]) => T },
    def: () => T,
  ): T;
  match<T>(
    arms: { [K in keyof Schema]?: (value: Schema[K]) => T },
    def?: () => T,
  ): T {
    if (this.#type in arms) {
      const arm = arms[this.#type];
      if (typeof arm !== "function") {
        panic(`${String(this.#type)} in match is not a function`);
      }
      return arm(this.#value);
    }

    if (typeof def !== "function") {
      panic("All arms in match should be filled or def should be a function");
    }

    return def();
  }

  /**
   * Checks whether the current variant matches the given type.
   */
  is(type: keyof Schema) {
    return type === this.#type;
  }

  /**
   * Attempts to change the current variant and its associated value.
   * @returns `true` if the change is valid and applied; otherwise `false`.
   */
  changeTo<T extends keyof Schema>(type: T, value: Schema[T]) {
    if (!this.isValidTypeValue(type, value)) return false;

    this.#type = type;
    this.#value = value;

    return true;
  }
}

type SetEnumThis<S extends object> = {
  [K in keyof S]: S[K] extends (this: S, ...args: infer Args) => infer Return
    ? (
        this: Omit<EnumMethods<S>, keyof GetArms<S>> & EnumClass<GetArms<S>>,
        ...args: Args
      ) => Return
    : S[K];
};

type EnumMethods<S extends object> = {
  [K in keyof S]: S[K] extends (...args: unknown[]) => unknown ? S[K] : never;
};

type KeyOfType<S extends object, T> = {
  [K in keyof S]: S[K] extends T ? K : never;
}[keyof S];

type GetArms<S extends object> = {
  [K in KeyOfType<S, ArmType<unknown>>]: S[K] extends ArmType<infer T>
    ? T
    : never;
};

export type GetEnumKeys<T> = T extends EnumClass<infer S> ? S : never;

type ArmMethods<S extends object, Class> = {
  [K in keyof S]: S[K] extends ArmType<infer T> ? (value: T) => Class : never;
};

const isArm = Symbol();
type ArmType<Value> = { [isArm]: Value };
export function Arm<Value = void>(): ArmType<Value> {
  return isArm as unknown as ArmType<Value>;
}

const ClassKey = "__classType__";
type ClassKey = typeof ClassKey;

interface BaseSchema {
  [ClassKey]?: ArmType<unknown>;
  /**
   * Optional validation hook used to restrict which `(type, value)` pairs
   * are allowed when constructing or mutating an enum instance.
   *
   * When provided, this method overrides the default validation logic
   * inside the generated enum class.
   * It is called during:
   *   - Initial construction of enum instances.
   *   - Calls to `.changeTo(type, value)`.
   *
   * Returning `true` allows the enum to use the given type and value.
   * Returning `false` rejects the combination and prevents construction or
   * mutation.
   *
   * @param {unknown} type
   * The enum type key being assigned (e.g. `"Success"`, `"Error"`, etc.).
   *
   * @param {unknown} value
   * The associated value being assigned to that type.
   *
   * @returns {boolean}
   * `true` if this type/value pair is permitted; otherwise `false`.
   *
   * @example
   * const MyEnum = Enum({
   *   A: Arm<number>(),
   *   B: Arm<string>(),
   *
   *   isValidTypeValue(type, value) {
   *     if (type === "A") return typeof value === "number" && value >= 0;
   *     if (type === "B") return typeof value === "string" && value.length < 5;
   *     return false;
   *   }
   * });
   */
  isValidTypeValue?(type: unknown, value: unknown): boolean;
  [key: string | symbol | number]: unknown;
}

/**
 * Creates a strongly-typed discriminated-union enum class from a schema
 * definition.
 *
 * The schema can contain:
 * - **Arms** constructed via {@link Arm}, which define the variant keys and
 *   the associated value types.
 * - **Methods**, which become instance methods on the resulting class.
 * - An optional class override via {@link Class}, enabling the enum to extend
 *   a custom class instead of the generated one.
 *
 * The returned class includes:
 * - Static constructors for each arm: `EnumType.MyVariant(value)`.
 * - All methods defined in the schema (with fixed `this` typing).
 * - The full API of {@link EnumClass}, including `.match`, `.is`, `.changeTo`,
 *   and more.
 *
 * @template S extends BaseSchema
 * The schema describing arms, methods, and optionally a custom class type.
 *
 * @param {SetEnumThis<S>} schema
 * A schema object where:
 * - Keys mapped to `Arm()` become enum variant constructors.
 * - Keys mapped to functions become instance methods (with `this` properly
 *   typed as the constructed enum instance).
 * - A special `__classType__` key may contain a custom class created via
 *   {@link Arm}, causing the enum to extend that class instead of the
 *   automatically generated one.
 *
 * @returns
 * A generated enum class with:
 * - Static arm constructors for each variant.
 * - Methods from the schema added to the prototype.
 * - Complete type inference for each variant's associated value.
 *
 * @example
 * const MyEnum = Enum({
 *   Foo: Arm<number>(),
 *   Bar: Arm<string>(),
 *   print() {
 *     this.match({
 *       Bar(value) {
 *         console.log("Bar:", value);
 *       },
 *       Foo(value) {
 *         console.log("Foo:", value);
 *       },
 *     });
 *   },
 * });
 *
 * const x = MyEnum.Foo(123);
 * x.print(); // "Foo: 123"
 *
 * @example
 * class CustomClass extends Enum({
 *   // This is so you don't have to do `CustomClass.A() as CustomClass`
 *   // Each time you instantiate the class
 *   __classType__: Arm<CustomClass>(),
 *   A: Arm(),
 *   B: Arm<number>(),
 * }) {
 *   baseMethod() {}
 * }
 *
 */
export function Enum<const S extends BaseSchema>({
  ...schema
}: SetEnumThis<S>) {
  type Schema = Omit<S, ClassKey>;
  type Arms = GetArms<Schema>;

  if (ClassKey in schema) {
    delete schema[ClassKey];
  }

  class NewEnum extends EnumClass<Arms> {
    override isValidTypeValue(
      type: keyof Arms,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      value: Arms[keyof Arms],
    ): boolean {
      return enumKeys.includes(type);
    }
  }

  type Class = S[ClassKey] extends ArmType<infer C> ? C : NewEnum;

  const schemaKeys = Object.getOwnPropertyNames(schema) as Array<keyof Schema>;
  schemaKeys.push(
    ...(Object.getOwnPropertySymbols(schema) as Array<keyof Schema>),
  );
  const enumKeys: (keyof Arms)[] = [];
  const methods: Record<string | number | symbol, unknown> = {};
  for (const key of schemaKeys) {
    const value = schema[key];
    if (typeof value === "function") {
      methods[key] = value;
      continue;
    }
    if (value !== isArm) continue;
    // @ts-ignore
    enumKeys.push(key);

    // @ts-ignore
    NewEnum[key] = function (enumValue) {
      // @ts-ignore
      return new this(key, enumValue);
    };
  }

  Object.assign(NewEnum.prototype, methods);

  return NewEnum as typeof NewEnum &
    ArmMethods<Schema, Class & Omit<EnumMethods<Schema>, keyof Arms>>;
}
