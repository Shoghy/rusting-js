import { panic } from "../panic.ts";

type ZeroParamFunc<T = unknown> = () => T;

export function Enum<Structure extends object>() {
  type EnumStates = keyof Structure;
  type EnumValues = Structure[EnumStates];

  type Func<T extends EnumStates, R> = Structure[T] extends void
    ? () => R
    : (value: Structure[T]) => R;

  type EnumJSON<T extends EnumStates> = Structure[T] extends void
    ? { type: T }
    : { type: T; value: Structure[T] };

  return class EnumClass {
    #type: EnumStates;
    #value?: EnumValues;

    constructor(type: EnumStates, value: Structure[typeof type]) {
      this.#type = type;
      this.#value = value;
    }

    changeTo<T extends EnumStates>(
      type: Structure[T] extends void ? T : never,
    ): void;
    changeTo<T extends EnumStates>(
      type: Structure[T] extends void ? never : T,
      value: Structure[T],
    ): void;
    changeTo<T extends EnumStates>(type: T, value?: Structure[T]): void {
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

    is(type: EnumStates): boolean;
    is(): EnumStates;
    is(type?: EnumStates): boolean | EnumStates {
      if (type !== undefined) {
        return this.#type === type;
      }
      return this.#type;
    }

    ifIs<T extends EnumStates>(type: T, func: Func<T, unknown>): void {
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
        return arm(this.#value as EnumValues);
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

    toJSON() {
      return {
        type: this.#type,
        value: this.#value,
      };
    }

    static fromJSON<T extends EnumStates>(json: EnumJSON<T>) {
      if (!("type" in json)) {
        panic("There is no `type` in `json`");
      }
      let value: EnumValues | undefined = undefined;
      if ("value" in json) {
        value = json.value;
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return new this(json.type, value);
    }
  };
}
