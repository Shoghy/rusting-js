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

const type_symbol = Symbol("type");
const value_symbol = Symbol("value");
const enum_symbol = Symbol("enum");

class EnumClass<E extends IEnum> {
  [type_symbol]: keyof E;
  [value_symbol]: Type2Value<E>[keyof E];
  static [enum_symbol]: IEnum;

  protected constructor(type: keyof E, value: Type2Value<E>[typeof type]) {
    const itype = this.get_enum_declaration()[type];
    checker: if (itype !== "unknown") {
      if (itype === "void") {
        if(value !== undefined){
          panic(`The value expected for the type ${type as string} of this Enum, is void`);
        }
        break checker;
      }

      if(typeof itype === "string"){
        if(typeof value !== itype){
          panic(`The value expected for the type ${type as string} of this Enum, is ${itype}`);
        }
        break checker;
      }

      if(!(value instanceof (itype as ClassConstructor))){
        panic(`The value expected for the type ${type as string} of this Enum, is ${itype.name}`);
      }
    }
    this[type_symbol] = type;
    this[value_symbol] = value;
  }

  get_enum_declaration(): Readonly<E>{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.constructor as any)[enum_symbol];
  }
}

type Type2Value<E extends IEnum> = {
  [key in keyof E]: E[key] extends "void"
  ? undefined
  : E[key] extends StrJSTypes
  ? JSTypes[E[key]]
  : E[key] extends ClassConstructor
  ? InstanceType<E[key]>
  : never
}

type Type2Func<E extends IEnum, R> = {
  [key in keyof E]: E[key] extends "void"
  ? ZeroParamFunc<R>
  : E[key] extends StrJSTypes
  ? (value: JSTypes[E[key]]) => R
  : E[key] extends ClassConstructor
  ? (value: InstanceType<E[key]>) => R
  : never
}

export function Enum<E extends IEnum>(enum_declaration: E) {
  type ET = keyof E;

  enum_declaration = Object.freeze(enum_declaration);

  return class EnumIClass extends EnumClass<E> {
    static [enum_symbol] = enum_declaration;

    static create<T extends ET>(type: E[T] extends "void" ? T : never): EnumIClass;
    static create<T extends ET>(type: E[T] extends "void" ? never : T, value: Type2Value<E>[T]): EnumIClass;
    static create<T extends ET>(type: T, value?: Type2Value<E>[T]): EnumIClass {
      const self = new this(type, value as Type2Value<E>[T]);
      if (enum_declaration[type] === "void") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (self as any)[value_symbol];
      }
      return self;
    }

    match<R>(arms: { [key in ET]: Type2Func<E, R>[key] }): R;
    match<R>(arms: { [key in ET]?: Type2Func<E, R>[key] }, def: ZeroParamFunc<R>): R;
    match<R>(arms: { [key in ET]?: Type2Func<E, R>[key] }, def?: ZeroParamFunc<R>): R {
      const arm = arms[this[type_symbol]];

      if (arm !== undefined) {
        if (enum_declaration[this[type_symbol]] === "void") {
          return (arm as ZeroParamFunc<R>)();
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return arm(this[value_symbol] as any);
        }
      }

      if (def !== undefined) {
        return def();
      }

      panic("All arms should be filled or `def` should be a function");
    }

    if_is<T extends ET>(type: T, func: Type2Func<E, unknown>[T]): void {
      if (type !== this[type_symbol]) {
        return;
      }

      if (enum_declaration[type] === "void") {
        (func as ZeroParamFunc)();
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      func(this[value_symbol] as any);
    }

    is(type: ET): boolean {
      return this[type_symbol] === type;
    }

    change_to<T extends ET>(type: E[T] extends "void" ? T : never): void;
    change_to<T extends ET>(type: E[T] extends "void" ? never : T, value: Type2Value<E>[T]): void;
    change_to<T extends ET>(type: T, value?: Type2Value<E>[T]): void {
      const itype = enum_declaration[type];
      checker: if (itype !== "unknown") {
        if (itype === "void") {
          if(value !== undefined){
            panic(`The value expected for the type ${type as string} of this Enum, is void`);
          }
          break checker;
        }

        if(typeof itype === "string"){
          if(typeof value !== itype){
            panic(`The value expected for the type ${type as string} of this Enum, is ${itype}`);
          }
          break checker;
        }

        if(!(value instanceof (itype as ClassConstructor))){
          panic(`The value expected for the type ${type as string} of this Enum, is ${itype.name}`);
        }
      }

      this[type_symbol] = type;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this[value_symbol] = value as any;
      if (enum_declaration[type] === "void") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (self as any)[value_symbol];
      }
    }

    toString(): string {
      if (enum_declaration[this[type_symbol]] === "void") {
        return this[type_symbol] as string;
      }
      return `${this[type_symbol] as string}(${this[value_symbol]})`;
    }
  };
}
