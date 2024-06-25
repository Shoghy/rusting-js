interface JSTypes {
  string: string
  number: number
  bigint: bigint
  boolean: boolean
  symbol: symbol
  object: object
  function: <A extends Array<unknown>, R>(...args: A) => R
}

type StrJSTypes = keyof JSTypes;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ClassConstructor = abstract new (...args: any) => any;

type ZeroParamFunc = () => unknown;

interface IEnum {
  [key: string]: StrJSTypes | ClassConstructor | "void"
}

export function Enum<E extends IEnum>(enum_values: E) {
  type ET = keyof E;
  // Cloning the values so the object cannot be modified
  const evalues: E = { ...enum_values };

  type Type2Value = {
    [key in ET]: E[key] extends "void"
    ? undefined
    : E[key] extends StrJSTypes
    ? JSTypes[E[key]]
    : E[key] extends ClassConstructor
    ? InstanceType<E[key]>
    : never
  }

  type Type2Func = {
    [key in ET]: E[key] extends "void"
    ? ZeroParamFunc
    : E[key] extends StrJSTypes
    ? (value: JSTypes[E[key]]) => unknown
    : E[key] extends ClassConstructor
    ? (value: InstanceType<E[key]>) => unknown
    : never
  }

  return class EnumClass {
    /**
     * This property shouldn't be public, but anonymous classes
     * cannot have private or protected properties or methods
     * @private
     */
    __type: ET;
    /**
     * This property shouldn't be public, but anonymous classes
     * cannot have private or protected properties or methods
     * @private
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    __value: any;

    /**
     * This property shouldn't be public, but anonymous classes
     * cannot have private or protected properties or methods
     * @protected
     */
    constructor(
      type: ET,
      value: unknown,
    ) {
      this.__type = type;
      this.__value = value;
    }

    get_type(): ET {
      return this.__type;
    }

    /**
     * This property shouldn't be public, but anonymous classes
     * cannot have private or protected properties or methods
     * @protected
     */
    _set_type<T extends ET>(type: E[T] extends "void" ? T : never): void;
    _set_type<T extends ET>(type: E[T] extends "void" ? never : T, value: Type2Value[T]): void;
    _set_type<T extends ET>(type: T, value?: Type2Value[T]): void {
      this.__type = type;
      if (evalues[type] === "void") {
        delete this.__value;
      }else{
        this.__value = value;
      }
    }

    static create<T extends ET>(type: E[T] extends "void" ? T : never): EnumClass;
    static create<T extends ET>(type: E[T] extends "void" ? never : T, value: Type2Value[T]): EnumClass;
    static create<T extends ET>(type: T, value?: Type2Value[T]): EnumClass {
      const self = new this(type, value);
      if (evalues[type] === "void") {
        delete self.__value;
      }
      return self;
    }

    is(type: ET): boolean {
      return this.__type === type;
    }

    if_is<T extends ET>(type: T, func: Type2Func[T]): void {
      if (type !== this.__type) {
        return;
      }

      if (evalues[type] === "void") {
        (func as ZeroParamFunc)();
        return;
      }

      func(this.__value);
    }

    match(arms: { [key in ET]: Type2Func[key] }): void;

    match(
      arms: {
        [key in ET]?: Type2Func[key]
      },
      def: ZeroParamFunc
    ): void;

    match(
      arms: {
        [key in ET]?: Type2Func[key]
      },
      def?: ZeroParamFunc
    ): void {
      const arm = arms[this.__type];

      if (arm !== undefined) {
        if (evalues[this.__type] === "void") {
          (arm as ZeroParamFunc)();
        } else {
          arm(this.__value);
        }
        return;
      }

      if (def !== undefined) {
        def();
        return;
      }

      throw new Error("All arms should be filled or `def` should be a function");
    }

    unwrap<T extends ET>(type: T): Type2Value[T] {
      if (evalues[type] === "void") {
        throw new Error(`The value ${type as string} of this enum, doesn't contain a value.`);
      }

      if (this.__type !== type) {
        throw new Error(`Enum is not ${type as string}`);
      }

      return this.__value;
    }

    expect<T extends ET>(type: T, msg: string): Type2Value[T] {
      if (evalues[type] === "void") {
        throw new Error(`The value ${type as string} of this enum, doesn't contain a value.`);
      }

      if (this.__type !== type) {
        throw new Error(msg);
      }

      return this.__value;
    }
  };
}
