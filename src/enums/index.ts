import { panic } from "../panic";

interface JSTypes {
  string: string
  number: number
  bigint: bigint
  boolean: boolean
  symbol: symbol
  object: object
  unknown: unknown
  function: <A extends Array<unknown>, R>(...args: A) => R
}

type StrJSTypes = keyof JSTypes;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ClassConstructor = abstract new (...args: any) => any;

type ZeroParamFunc<T = unknown> = () => T;

interface IEnum {
  [key: string]: StrJSTypes | ClassConstructor | "void"
}

export function Enum<E extends IEnum>(evalues: E) {
  type ET = keyof E;

  evalues = Object.freeze(evalues);

  type Type2Value = {
    [key in ET]: E[key] extends "void"
    ? undefined
    : E[key] extends StrJSTypes
    ? JSTypes[E[key]]
    : E[key] extends ClassConstructor
    ? InstanceType<E[key]>
    : never
  }

  type Type2Func<T = unknown> = {
    [key in ET]: E[key] extends "void"
    ? ZeroParamFunc<T>
    : E[key] extends StrJSTypes
    ? (value: JSTypes[E[key]]) => T
    : E[key] extends ClassConstructor
    ? (value: InstanceType<E[key]>) => T
    : never
  }

  function checker(type: ET, value: unknown): void {
    if (!(type in evalues)) {
      panic(`\`${type as string}\` is not a posible state of this Enum.`);
    }

    const hold_type = evalues[type];
    if (hold_type === "unknown") {
      return;
    }

    if (hold_type === "void") {
      if (value !== undefined) {
        panic(`The value expected for the type ${type as string} of this Enum, is void`);
      }
      return;
    }

    if (typeof hold_type === "string") {
      if (typeof value !== hold_type) {
        panic(`The value expected for the type ${type as string} of this Enum, is ${hold_type}`);
      }
      return;
    }

    if (!(value instanceof (hold_type as ClassConstructor))) {
      panic(`The value expected for the type ${type as string} of this Enum, is ${hold_type.name}`);
    }
  }

  const type_symbol = Symbol("type");
  const value_symbol = Symbol("value");
  const update_symbol = Symbol("pass");

  return class EnumClass {
    constructor(
      type: ET,
      value: unknown,
    ) {
      this.update(update_symbol, type, value);
    }

    /**
     * Don't call this method. This method is for internal use of the class.
     * If called it will panic.
     */
    update(sym: symbol, type: ET, value: unknown): void {
      if (sym !== update_symbol) {
        panic("`update` was called outside of `EnumClass`");
      }

      checker(type, value);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this as any)[type_symbol] = type;
      if (value === undefined) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (this as any)[value_symbol];
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (this as any)[value_symbol] = value;
      }
    }

    /**
     * Don't call this method. This method is for internal use of the class.
     * If called it will panic.
     */
    get(sym: symbol) {
      if (sym !== type_symbol && sym !== value_symbol) {
        panic("`get` was called outside of `EnumClass`");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (this as any)[sym];
    }

    change_to<T extends ET>(type: E[T] extends "void" ? T : never): void;
    change_to<T extends ET>(type: E[T] extends "void" ? never : T, value: Type2Value[T]): void;
    change_to<T extends ET>(type: T, value?: Type2Value[T]): void {
      this.update(update_symbol, type, value);
    }

    static create<T extends ET>(type: E[T] extends "void" ? T : never): EnumClass;
    static create<T extends ET>(type: E[T] extends "void" ? never : T, value: Type2Value[T]): EnumClass;
    static create<T extends ET>(type: T, value?: Type2Value[T]): EnumClass {
      return new this(type, value);
    }

    is(type: ET): boolean {
      return this.get(type_symbol) === type;
    }

    if_is<T extends ET>(type: T, func: Type2Func[T]): void {
      if (type !== this.get(type_symbol)) {
        return;
      }

      if (evalues[type] === "void") {
        (func as ZeroParamFunc)();
        return;
      }

      func(this.get(value_symbol));
    }

    match<T>(arms: { [key in ET]: Type2Func<T>[key] }): T;
    match<T>(arms: { [key in ET]?: Type2Func<T>[key] }, def: ZeroParamFunc<T>): T;
    match<T>(arms: { [key in ET]?: Type2Func<T>[key] }, def?: ZeroParamFunc<T>): T {
      const arm = arms[this.get(type_symbol)];

      if (arm !== undefined) {
        if (evalues[this.get(type_symbol)] === "void") {
          return (arm as ZeroParamFunc<T>)();
        } else {
          return arm(this.get(value_symbol));
        }
      }

      if (def !== undefined) {
        return def();
      }

      panic("All arms should be filled or `def` should be a function");
    }

    toString(): string {
      if (evalues[this.get(type_symbol)] === "void") {
        return this.get(type_symbol);
      }
      return `${this.get(type_symbol)}(${this.get(value_symbol)})`;
    }
  };
}

export { Option, Some, None } from "./option";
export { Result, Ok, Err } from "./result";
export { ControlFlow } from "./control_flow";