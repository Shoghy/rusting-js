import { panic } from "../panic.ts";

type ZeroParamFunc<T = unknown> = () => T;

export function Enum<Structure extends object>() {
  type EnumStates = keyof Structure;

  type Func<T extends EnumStates, R> = Structure[T] extends void
    ? () => R
    : (value: Structure[T]) => R;

  return class EnumClass {
    #type: EnumStates;
    #value?: Structure[EnumStates];

    constructor(type: EnumStates, value: Structure[typeof type]) {
      this.#type = type;
      this.#value = value;
    }

    change_to<T extends EnumStates>(
      type: Structure[T] extends void ? T : never,
    ): void;
    change_to<T extends EnumStates>(
      type: Structure[T] extends void ? never : T,
      value: Structure[T],
    ): void;
    change_to<T extends EnumStates>(type: T, value?: Structure[T]): void {
      this.#type = type;
      this.#value = value;
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
      return this.#type === type;
    }

    if_is<T extends EnumStates>(type: T, func: Func<T, unknown>): void {
      if (this.#type !== type) {
        return;
      }

      func(this.#value as Structure[T]);
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
      const arm = arms[this.#type];

      if (arm !== undefined) {
        return arm(this.#value as Structure[EnumStates]);
      }

      if (def !== undefined) {
        return def();
      }

      panic("All arms should be filled or `def` should be a function");
    }

    toString(): string {
      if (this.#value === undefined) {
        return String(this.#type);
      }
      return `${String(this.#type)}(${this.#value})`;
    }
  };
}
