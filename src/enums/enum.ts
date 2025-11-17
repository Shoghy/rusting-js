/* eslint-disable @typescript-eslint/ban-ts-comment */
import { panic } from "../panic.ts";

export abstract class EnumClass<Schema extends object> {
  #type: keyof Schema;
  #value: Schema[keyof Schema];

  protected constructor(type: keyof Schema, value: Schema[keyof Schema]) {
    if (!this.isValidType(type)) {
      panic("Invalid type");
    }
    this.#type = type;
    this.#value = value;
  }

  abstract isValidType(type: keyof Schema): boolean;

  ifIs<T extends keyof Schema>(type: T, func: (value: Schema[T]) => void) {
    if (type !== this.#type) return;
    func(this.#value as Schema[T]);
  }

  match<T>(arms: { [K in keyof Schema]: (value: Schema[K]) => T }): T;
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

  is(type: keyof Schema) {
    return type === this.#type;
  }

  changeTo<T extends keyof Schema>(type: T, value: Schema[T]) {
    if (!this.isValidType(type)) return false;

    this.#type = type;
    this.#value = value;

    return true;
  }
}

type SetEnumThis<S extends object> = {
  [K in keyof S]: S[K] extends (this: S, ...args: infer Args) => infer Return
    ? (this: EnumMethods<S> & EnumClass<GetArms<S>>, ...args: Args) => Return
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

type ArmMethods<S extends object, Class> = {
  [K in keyof S]: S[K] extends ArmType<infer T> ? (value: T) => Class : never;
};

type ArmType<Value> = { [isArm]: Value };

export function Enum<const S extends object>(schema: SetEnumThis<S>) {
  type Arms = GetArms<S>;
  class NewEnum extends EnumClass<Arms> {
    isValidType(type: keyof Arms): boolean {
      return enumKeys.includes(type);
    }
  }

  const enumKeys: (keyof Arms)[] = [];
  const methods: Record<string | number | symbol, unknown> = {};
  for (const key in schema) {
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

  return NewEnum as typeof NewEnum & ArmMethods<S, NewEnum & EnumMethods<S>>;
}

const isArm = Symbol();
export function Arm<Value = void>(): ArmType<Value> {
  return isArm as unknown as ArmType<Value>;
}
