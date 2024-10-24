import { panic } from "../panic.ts";

type ZeroParamFunc<T = unknown> = () => T;

export function Enum<Structure extends object>() {
  type EnumStates = keyof Structure;

  const type_symbol = Symbol("type");
  const value_symbol = Symbol("value");
  const update_symbol = Symbol("update");

  type Func<T extends EnumStates, R> = Structure[T] extends void
    ? () => R
    : (value: Structure[T]) => R;

  return class EnumClass {
    constructor(type: EnumStates, value: Structure[typeof type]) {
      this.update(update_symbol, type, value);
    }

    /**
     * Don't call this method. This method is for internal use of the class.
     * If called it will panic.
     */
    update(sym: symbol, type: EnumStates, value: unknown): void {
      if (sym !== update_symbol) {
        panic("`update` was called outside of `EnumClass`");
      }

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

    change_to<T extends EnumStates>(
      type: Structure[T] extends void ? T : never,
    ): void;
    change_to<T extends EnumStates>(
      type: Structure[T] extends void ? never : T,
      value: Structure[T],
    ): void;
    change_to<T extends EnumStates>(type: T, value?: Structure[T]): void {
      this.update(update_symbol, type, value);
    }

    static create<T extends EnumStates>(
      type: Structure[T] extends void ? T : never,
    ): EnumClass;
    static create<T extends EnumStates>(
      type: Structure[T] extends void ? never : T,
      value: Structure[T],
    ): EnumClass;
    static create<T extends EnumStates>(
      type: T,
      value?: Structure[T],
    ): EnumClass {
      return new this(type, value as Structure[T]);
    }

    is(type: EnumStates): boolean {
      return this.get(type_symbol) === type;
    }

    if_is<T extends EnumStates>(type: T, func: Func<T, unknown>): void {
      if (type !== this.get(type_symbol)) {
        return;
      }

      func(this.get(value_symbol));
    }

    match<T>(arms: { [K in EnumStates]: Func<K, T> }): T;
    match<T>(
      arms: { [K in EnumStates]?: Func<K, T> },
      def: ZeroParamFunc<T>,
    ): T;
    match<T>(
      arms: { [K in EnumStates]?: Func<K, T> },
      def?: ZeroParamFunc<T>,
    ): T {
      const arm = arms[this.get(type_symbol) as EnumStates];

      if (arm !== undefined) {
        return arm(this.get(value_symbol));
      }

      if (def !== undefined) {
        return def();
      }

      panic("All arms should be filled or `def` should be a function");
    }

    toString(): string {
      if (this.get(value_symbol) === undefined) {
        return this.get(type_symbol);
      }
      return `${this.get(type_symbol)}(${this.get(value_symbol)})`;
    }
  };
}
