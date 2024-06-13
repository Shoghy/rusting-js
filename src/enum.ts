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
  const evalues: E = {... enum_values};

  return class EnumClass {
    private type: ET;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private value!: any;

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

    protected set_type<T extends ET>(
      type: T,
      value: E[T] extends "void"
        ? undefined
        : E[T] extends StrJSTypes
        ? JSTypes[E[T]]
        : E[T] extends ClassConstructor
        ? InstanceType<E[T]>
        : undefined
    ) {
      this.type = type;
      this.value = value;
    }

    static create<T extends ET>(
      type: T,
      value: E[T] extends "void"
        ? undefined
        : E[T] extends StrJSTypes
        ? JSTypes[E[T]]
        : E[T] extends ClassConstructor
        ? InstanceType<E[T]>
        : undefined
    ): EnumClass {
      const self = new EnumClass(type, value);
      if(evalues[type] === "void"){
        delete self.value;
      }
      return self;
    }

    is(type: ET): boolean {
      return this.type === type;
    }

    if_is<T extends ET>(
      type: T,
      func: E[T] extends "void"
        ? () => unknown
        : E[T] extends StrJSTypes
        ? (value: JSTypes[E[T]]) => unknown
        : E[T] extends ClassConstructor
        ? (value: InstanceType<E[T]>) => unknown
        : () => unknown
    ): void {
      if (evalues[type] !== this.type) {
        return;
      }

      if (evalues[type] === "void") {
        (func as () => unknown)();
        return;
      }

      func(this.value);
    }

    match(arms: {
      [key in ET]: E[key] extends "void"
      ? () => unknown
      : E[key] extends StrJSTypes
      ? (value: JSTypes[E[key]]) => unknown
      : E[key] extends ClassConstructor
      ? (value: InstanceType<E[key]>) => unknown
      : () => unknown
    }): void;

    match(arms: {
      [key in ET]?: E[key] extends "void"
      ? () => unknown
      : E[key] extends StrJSTypes
      ? (value: JSTypes[E[key]]) => unknown
      : E[key] extends ClassConstructor
      ? (value: InstanceType<E[key]>) => unknown
      : () => unknown
    }, def: () => unknown): void;

    match(
      arms: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key in ET]?: (value?: any) => unknown
      },
      def?: () => unknown
    ): void {
      const arm = arms[this.type];

      if(arm !== undefined){
        if(evalues[this.type] === "void"){
          arm();
        }else{
          arm(this.value);
        }
        return;
      }

      if(def !== undefined){
        def();
        return;
      }

      throw new Error("All arms should be filled or `def` should be a function");
    }

    unwrap<T extends ET>(type: T) {
      if (evalues[type] === "void") {
        throw new Error(`The value ${new String(type)} of this enum, doesn't contain a value.`);
      }

      if (this.type !== type) {
        throw new Error(`Enum is not ${new String(type)}`);
      }

      return (
        this.value as E[T] extends StrJSTypes
        ? JSTypes[E[T]]
        : E[T] extends ClassConstructor
        ? InstanceType<E[T]>
        : undefined
      );
    }

    expect<T extends ET>(type: T, msg: string) {
      if (evalues[type] === "void") {
        throw new Error(`The value ${new String(type)} of this enum, doesn't contain a value.`);
      }

      if (this.type !== type) {
        throw new Error(msg);
      }

      return (
        this.value as E[T] extends StrJSTypes
        ? JSTypes[E[T]]
        : E[T] extends ClassConstructor
        ? InstanceType<E[T]>
        : undefined
      );
    }
  };
}
