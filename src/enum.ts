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
    : undefined
  }

  type Type2Func = {
    [key in ET]: E[key] extends "void"
    ? () => unknown
    : E[key] extends StrJSTypes
    ? (value: JSTypes[E[key]]) => unknown
    : E[key] extends ClassConstructor
    ? (value: InstanceType<E[key]>) => unknown
    : () => unknown
  }

  return class EnumClass {
    private type: ET;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private value: any;

    protected constructor(
      type: ET,
      value: unknown,
    ) {
      this.type = type;
      this.value = value;
    }

    get_type(): ET {
      return this.type;
    }

    protected set_type<T extends ET>(type: T, value: Type2Value[T]): void {
      this.type = type;
      this.value = value;
    }

    static create<T extends ET>(type: T, value: Type2Value[T]): EnumClass {
      const self = new this(type, value);
      if (evalues[type] === "void") {
        delete self.value;
      }
      return self;
    }

    is(type: ET): boolean {
      return this.type === type;
    }

    if_is<T extends ET>(type: T, func: Type2Func[T]): void {
      if (type !== this.type) {
        return;
      }

      if (evalues[type] === "void") {
        (func as () => unknown)();
        return;
      }

      func(this.value);
    }

    match(arms: { [key in ET]: Type2Func[key] }): void;

    match(
      arms: {
        [key in ET]?: Type2Func[key]
      },
      def: () => unknown
    ): void;

    match(
      arms: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key in ET]?: (value?: any) => unknown
      },
      def?: () => unknown
    ): void {
      const arm = arms[this.type];

      if (arm !== undefined) {
        if (evalues[this.type] === "void") {
          arm();
        } else {
          arm(this.value);
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

      if (this.type !== type) {
        throw new Error(`Enum is not ${type as string}`);
      }

      return this.value;
    }

    expect<T extends ET>(type: T, msg: string): Type2Value[T] {
      if (evalues[type] === "void") {
        throw new Error(`The value ${type as string} of this enum, doesn't contain a value.`);
      }

      if (this.type !== type) {
        throw new Error(msg);
      }

      return this.value;
    }
  };
}
