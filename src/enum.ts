import { panic } from "./panic";

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

  const type_symbol = Symbol("type");
  const value_symbol = Symbol("value");

  return class EnumClass {
    constructor(
      type: ET,
      value: unknown,
    ) {
      this.update(type_symbol, type);
      this.update(value_symbol, value);
    }

    get_type(): ET {
      return this.get(type_symbol);
    }

    /**
     * Don't call this method. This method is for internal use of the class.
     * If called it will panic.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    update(sym: symbol, value?: any): void {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const self = this as any;
      if (sym === type_symbol) {
        if (!(value in evalues)) {
          panic("Invalid value for `type`");
        }
      } else if (sym === value_symbol) {
        if (value === undefined) {
          delete self[sym];
          return;
        }
      } else {
        panic("`update` was called outside of `EnumClass`");
      }
      self[sym] = value;
    }

    /**
     * Don't call this method. This method is for internal use of the class.
     * If called it will panic.
     */
    get(sym: symbol) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const self = this as any;
      if (sym !== type_symbol && sym !== value_symbol) {
        panic("`get` was called outside of `EnumClass`");
      }
      return self[sym];
    }

    change_to<T extends ET>(type: E[T] extends "void" ? T : never): void;
    change_to<T extends ET>(type: E[T] extends "void" ? never : T, value: Type2Value[T]): void;
    change_to<T extends ET>(type: T, value?: Type2Value[T]): void {
      this.update(type_symbol, type);
      if (evalues[type] === "void") {
        this.update(value_symbol, undefined);
      } else {
        this.update(value_symbol, value);
      }
    }

    static create<T extends ET>(type: E[T] extends "void" ? T : never): EnumClass;
    static create<T extends ET>(type: E[T] extends "void" ? never : T, value: Type2Value[T]): EnumClass;
    static create<T extends ET>(type: T, value?: Type2Value[T]): EnumClass {
      const self = new this(type, value);
      if (evalues[type] === "void") {
        self.update(value_symbol);
      }
      return self;
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
