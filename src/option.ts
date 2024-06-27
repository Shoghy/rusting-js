import { panic } from "./panic";
import { Err, Ok, type Result } from "./result";

enum EType {
  Some,
  None,
}

const type_symbol = Symbol("type");
const value_symbol = Symbol("value");

export class Option<T> {
  private [value_symbol]!: T;
  private [type_symbol]: EType;

  private constructor(type: EType) {
    this[type_symbol] = type;
  }

  /**
   * Creates a `Some` type `Option`
   */
  static Some<T>(value: T): Option<T> {
    const self = new Option<T>(EType.Some);
    self[value_symbol] = value;
    return self;
  }

  /**
   * Creates a `None` type `Option`
   */
  static None<T>(): Option<T> {
    return new Option(EType.None);
  }

  /**
   * It returns true if `Option` is `Some`
   * @example
   * const some = Some(0);
   * expect(some.is_some()).toBe(true);
   *
   * const none = None();
   * expect(none.is_some()).toBe(false);
   */
  is_some(): boolean {
    return this[type_symbol] === EType.Some;
  }

  /**
   * It returns true if `Option` is `None`
   * @example
   * const some = Some(0);
   * expect(some.is_none()).toBe(false);
   *
   * const none = None();
   * expect(none.is_none()).toBe(true);
   */
  is_none(): boolean {
    return this[type_symbol] === EType.None;
  }

  /**
   * Execute the `func` parameter if `Option` is `Some`
   * @example
   * const some = Some([1, 2, 3, 4]);
   * some.inspect((value) => {
   *   expect(value).toEqual([1, 2, 3, 4]);
   * });
   *
   * const none = None<number[]>();
   * none.inspect(() => {
   *   unreachable();
   * });
   */
  inspect(func: (value: T) => unknown): this {
    if (!this.is_some()) return this;
    func(this[value_symbol]);
    return this;
  }

  /**
   * Returns `this` if it is `Some`, otherwise returns optb
   * @example
   * let val1 = Some("lorem");
   * let val2 = None<string>();
   * expect(val1.or(val2)).toEqual(Some("lorem"));
   *
   * val1 = None();
   * val2 = Some("6.02214076 * 10^23");
   * expect(val1.or(val2)).toEqual(Some("6.02214076 * 10^23"));
   *
   * val1 = Some("あなた");
   * val2 = Some("かわいい");
   * expect(val1.or(val2)).toEqual(Some("あなた"));
   *
   * val1 = None();
   * val2 = None();
   * expect(val1.or(val2)).toEqual(None());
   */
  or(optb: Option<T>): Option<T> {
    if (this.is_some()) {
      return this;
    }
    return optb;
  }

  /**
   * Returns `this` if is `Some`, otherwise execute the `func` parameter and return its returned value.
   * @example
   * const none = None<number[]>();
   * const result1 = none.or_else(() => {
   *   return Some([4, 20]);
   * });
   * expect(result1).toEqual(Some([4, 20]));
   *
   * const some = Some(69);
   * const result2 = some.or_else(() => {
   *   return Some(13);
   * });
   * expect(result2).toEqual(Some(69));
   */
  or_else(func: () => Option<T>): Option<T> {
    if (this.is_some()) {
      return this;
    }
    return func();
  }

  /**
   * Returns `Some` if just one of `this` and `optb` is `Some`, otherwise returns `None`
   * @example
   * let val1 = Some(1);
   * let val2 = None<number>();
   * expect(val1.xor(val2)).toEqual(Some(1));
   *
   * val1 = None();
   * val2 = Some(2);
   * expect(val1.xor(val2)).toEqual(Some(2));
   *
   * val1 = Some(3);
   * val2 = Some(4);
   * expect(val1.xor(val2)).toEqual(None());
   *
   * val1 = None();
   * val2 = None();
   * expect(val1.xor(val2)).toEqual(None());
   */
  xor(optb: Option<T>): Option<T> {
    if (this.is_some() && optb.is_some()) {
      return None();
    }
    if (this.is_some()) {
      return this;
    }
    if (optb.is_some()) {
      return optb;
    }
    return None();
  }

  /**
   * Returns `optb` parameter if both `this` and `optb` are `Some`, otherwise returns `None`
   * @example
   * let val1 = Some("Español");
   * let val2 = None<string>();
   * expect(val1.and(val2)).toEqual(None());
   * 
   * val1 = None();
   * val2 = Some("Português");
   * expect(val1.and(val2)).toEqual(None());
   * 
   * val1 = Some("English");
   * val2 = Some("日本語");
   * expect(val1.and(val2)).toEqual(Some("日本語"));
   * 
   * val1 = None();
   * val2 = None();
   * expect(val1.and(val2)).toEqual(None());
   */
  and<U>(optb: Option<U>): Option<U> {
    if (this.is_some() && optb.is_some()) {
      return optb;
    }
    return None();
  }

  /**
   * If `Option` is `Some`, execute the `func` parameter and return its returned value, otherwise return `None`
   * @example
   * const none = None<number>();
   * const result1 = none.and_then((value) => {
   *   return Some(value * value);
   * });
   * expect(result1).toEqual(None());
   * 
   * const some = Some(5);
   * const result = some.and_then((value) => {
   *   return Some(value * value);
   * });
   * expect(result).toEqual(Some(25));
   */
  and_then<U>(func: (value: T) => Option<U>): Option<U> {
    if (this.is_some()) {
      return func(this[value_symbol]);
    }
    return None();
  }

  /**
   * Returns the `value` contained in `Some`.
   * If `Option` is `None` panics.
   * @throws {Error}
   * @example
   * const none = None();
   * const msg = "This should throw an exception";
   * expect(() => none.expect(msg)).toThrowError(msg);
   *
   * const some = Some(1);
   * const val = some.expect("This should not panic");
   * expect(val).toBe(1);
   */
  expect(msg: string): T {
    if (this.is_some()) {
      return this[value_symbol];
    }
    panic(msg);
  }

  /**
   * If `Option` is `None` insert the `value` parameter in `Option`, then return the value. If `Option` is `Some` it just return its value.
   * @example
   * const option1 = None<number>();
   * const result1 = option1.get_or_insert(3.1415);
   * expect(result1).toBe(3.1415);
   * expect(option1).toEqual(Some(3.1415));
   * 
   * const option2 = Some(42);
   * const result2 = option2.get_or_insert(19);
   * expect(result2).toBe(42);
   * expect(option2).toEqual(Some(42));
   */
  get_or_insert(value: T): T {
    if (this.is_none()) {
      this[value_symbol] = value;
      this[type_symbol] = EType.Some;
    }
    return this[value_symbol];
  }

  /**
   * If `Option` is `None` execute the `func` parameter and insert its returned value in `Option` then return the inserted value. If `Option` is `Some` it just return its value.
   * @example
   * const option1 = None<string>();
   * const result1 = option1.get_or_insert_with(
   *   () => "Hello World!"
   * );
   * expect(result1).toEqual("Hello World!");
   * expect(option1).toEqual(Some("Hello World!"));
   * 
   * const option2 = Some("Cards Against Humanity");
   * const result2 = option2.get_or_insert_with(
   *   () => "Humanity"
   * );
   * expect(result2).toEqual("Cards Against Humanity");
   * expect(option2).toEqual(Some("Cards Against Humanity"));
   */
  get_or_insert_with(func: () => T): T {
    if (this.is_none()) {
      this[value_symbol] = func();
      this[type_symbol] = EType.Some;
    }
    return this[value_symbol];
  }

  /**
   * Insert the `value` parameter in `Option` and return it.
   * @example
   * const cool_song = "https://open.spotify.com/track/4S3dFI8Sx3UsKOUnoYFCg2";
   * 
   * const option1 = None<string>();
   * const result1 = option1.insert(cool_song);
   * expect(result1).toBe(cool_song);
   * expect(option1).not.toEqual(None());
   * expect(option1).toEqual(Some(cool_song));
   * 
   * const option2 = Some(1);
   * const result2 = option2.insert(2);
   * expect(result2).toBe(2);
   * expect(option2).not.toEqual(Some(1));
   * expect(option2).toEqual(Some(2));
   */
  insert(value: T): T {
    this[value_symbol] = value;
    this[type_symbol] = EType.Some;
    return this[value_symbol];
  }

  /**
   * If `Option` is `None` returns `false`, if it is `Some` execute the `func` parameter and return its returned value.
   * @example
   * const r_true = () => true;
   * const r_false = () => false;
   * 
   * const none = None();
   * expect(none.is_some_and(r_true)).toBe(false);
   * expect(none.is_some_and(r_false)).toBe(false);
   * 
   * const some = Some(1);
   * expect(some.is_some_and(r_true)).toBe(true);
   * expect(some.is_some_and(r_false)).toBe(false);
   * expect(some.is_some_and((value) => value == 1)).toBe(true);
   * expect(some.is_some_and((value) => value == 2)).toBe(false);
   */
  is_some_and(func: (value: T) => boolean): boolean {
    if (this.is_none()) {
      return false;
    }
    return func(this[value_symbol]);
  }

  /**
   * If `Option` is `Some`, remove its value and return it wrapped in an `Option`. If `Option` is `None` return `None`.
   * @example
   * let option1 = Some(142857);
   * let option2 = option1.take();
   * 
   * expect(option1).toEqual(None());
   * expect(option2).toEqual(Some(142857));
   * 
   * option1 = None();
   * option2 = option1.take();
   * expect(option1).toEqual(None());
   * expect(option2).toEqual(None());
   */
  take(): Option<T> {
    if (this.is_none()) {
      return None();
    }
    const value = this[value_symbol];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (this as any)[value_symbol];
    this[type_symbol] = EType.None;
    return Some(value);
  }

  /**
   * Returns the `value` contained in `Some`.
   * @throws {Error}
   * If `Option` is `None` panics.
   * @example
   * const none = None();
   * expect(() => none.unwrap()).toThrow();
   *
   * const some = Some(1);
   * const val = some.unwrap();
   * expect(val).toBe(1);
   */
  unwrap(): T {
    if (this.is_some()) {
      return this[value_symbol];
    }
    panic("Called `unwrap` method on a `None`");
  }

  /**
   * If `Option` is `Some` return its value. If `Option` is `None` return the parameter `value`.
   * @example
   * const none = None<string>();
   * const result1 = none.unwrap_or("31 minutos");
   * expect(result1).toBe("31 minutos");
   * 
   * const some = Some("Mr. Trance");
   * const result2 = some.unwrap_or("Esteman");
   * expect(result2).toBe("Mr. Trance");
   */
  unwrap_or(value: T): T {
    if (this.is_some()) {
      return this[value_symbol];
    }
    return value;
  }

  /**
   * If `Option` is `Some` return its value. If `Option` is `None` execute the parameter `func` and return its returned value
   * @example
   * const none = None<number>();
   * const result1 = none.unwrap_or_else(() => 0xe0218a);
   * expect(result1).toBe(0xe0218a);
   * 
   * const some = Some(0);
   * const result2 = some.unwrap_or_else(() => 1);
   * expect(result2).toBe(0);
   */
  unwrap_or_else(func: () => T): T {
    if (this.is_some()) {
      return this[value_symbol];
    }
    return func();
  }

  /**
   * If `this` and `other` are `Some` return a `Some` that holds both parameters, otherwise returns `None`
   * @example
   * let val1 = Some(1);
   * let val2 = None<string>();
   * expect(val1.zip(val2)).toEqual(None());
   * 
   * val1 = None();
   * val2 = Some("thing");
   * expect(val1.zip(val2)).toEqual(None());
   * 
   * val1 = Some(0+0+7);
   * val2 = Some("Agente");
   * expect(val1.zip(val2)).toEqual(Some([7, "Agente"]));
   * 
   * val1 = None();
   * val2 = None();
   * expect(val1.zip(val2)).toEqual(None());
   */
  zip<U>(other: Option<U>): Option<[T, U]> {
    if (this.is_none() || other.is_none()) {
      return None();
    }
    return Some([this[value_symbol], other[value_symbol]]);
  }

  toString(): string {
    if (this.is_some()) {
      return `Some(${this[value_symbol]})`;
    }
    return "None";
  }

  is_equal_to(other: Option<T>): boolean {
    if (this[type_symbol] !== other[type_symbol]) {
      return false;
    }
    if (this[type_symbol] === EType.None) {
      return true;
    }
    return this[value_symbol] === other[value_symbol];
  }

  /**
   * If `Option` is `Some` it will call the `func` parameter
   * and return its returned value wrapped in a `Some`,
   * otherwise it will return `None`
   * @example
   * const none = None<string>();
   * const result1 = none.map((value) => {
   *   return value.length;
   * });
   * expect(result1).toEqual(None());
   * 
   * const some = Some("1234");
   * const result2 = some.map((value) => {
   *   return value.length;
   * });
   * expect(result2).toEqual(Some(4));
   */
  map<U>(func: (value: T) => U): Option<U> {
    if (this.is_none()) {
      return None();
    }
    return Some(func(this[value_symbol]));
  }

  /**
   * If `Option` is `Some` it will call the `func` parameter
   * and return its returned value,
   * otherwise it will return the `def` parameter
   * @example
   * const none = None();
   * const result1 = none.map_or("Hola", () => {
   *   return "Hello";
   * });
   * expect(result1).toBe("Hola");
   * 
   * const some = Some(356);
   * const result2 = some.map_or("NotAHexNumber", (value) => {
   *   return value.toString(16);
   * });
   * expect(result2).toBe("164");
   */
  map_or<U>(def: U, func: (value: T) => U): U {
    if (this.is_none()) {
      return def;
    }
    return func(this[value_symbol]);
  }

  /**
   * If `Option` is `Some` it will call the `some` property function
   * and return its returned value. If `Option` is `None` it will call
   * the `none` property function and return its returned value.
   * @example
   * const none = None();
   * const result1 = none.map_or_else({
   *   some: () => {
   *     return "It is Some";
   *   },
   *   none: () => {
   *     return "It is None";
   *   },
   * });
   * expect(result1).toBe("It is None");
   * 
   * const some = Some(17);
   * const result2 = some.map_or_else({
   *   some: (value) => {
   *     return value.toString();
   *   },
   *   none: () => {
   *     return "It is None";
   *   },
   * });
   * expect(result2).toBe("17");
   */
  map_or_else<U>(arms: {
    some: (value: T) => U,
    none: () => U,
  }): U {
    if (this.is_none()) {
      return arms.none();
    }
    return arms.some(this[value_symbol]);
  }

  /**
   * If `Option` is `Some` it will return its value wrapped on an `Ok`.
   * If `Option` is `None` it will return the `err` parameter wrapped
   * on an `Err`.
   * @example
   * const none = None();
   * const result1 = none.ok_or("The value was a None");
   * expect(result1).toEqual(Err("The value was a None"));
   * 
   * const some = Some(9);
   * const result2 = some.ok_or("The value was a None");
   * expect(result2).toEqual(Ok(9));
   */
  ok_or<E>(err: E): Result<T, E> {
    if (this.is_none()) {
      return Err(err);
    }
    return Ok(this[value_symbol]);
  }

  /**
   * If `Option` is `Some` it will return its value wrapped on an `Ok`.
   * If `Option` is `None` it will call the `func` parameter and
   * return its returned value wrapped on an `Err`.
   * @example
   * const none = None();
   * const result1 = none.ok_or_else(() => 68);
   * expect(result1).toEqual(Err(68));
   * 
   * const some = Some("DCLXVI");
   * const result2 = some.ok_or_else(() => "DCXVI");
   * expect(result2).toEqual(Ok("DCLXVI"));
   */
  ok_or_else<E>(func: () => E): Result<T, E> {
    if (this.is_some()) {
      return Ok(this[value_symbol]);
    }
    return Err(func());
  }

  /**
   * This method return the value in `Some` or `undefined` if its `None`, without
   * any previous check. AVOID USING THIS METHOD.
   * @example
   * const none = None();
   * const result1 = none.unwrap_unchecked();
   * expect(result1).toBe(undefined);
   * 
   * const some = Some("Some");
   * const result2 = some.unwrap_unchecked();
   * expect(result2).toBe("Some");
   */
  unwrap_unchecked(): T | undefined {
    return this[value_symbol];
  }

  /**
   * Call the `func` parameter just if `Option` is `Some`.
   * @example
   * let value = 0;
   * const none = None();
   * none.if_some(() => {
   *   value = 1;
   * });
   * expect(value).toBe(0);
   * 
   * value = 0;
   * const some = Some(1);
   * some.if_some((v) => {
   *   value = v;
   * });
   * expect(value).toBe(1);
   */
  if_some(func: (value: T) => unknown): void {
    if (this.is_none()) {
      return;
    }
    func(this[value_symbol]);
  }

  /**
   * Call the `func` parameter just if `Option` is `None`.
   * @example
   * let value = 0;
   * const none = None();
   * none.if_none(() => {
   *   value = 1;
   * });
   * expect(value).toBe(1);
   * 
   * value = 0;
   * const some = Some(1);
   * some.if_none(() => {
   *   value = 1;
   * });
   * expect(value).toBe(0);
   */
  if_none(func: () => unknown): void {
    if (this.is_some()) {
      return;
    }
    func();
  }

  /**
   * If `Option` is `Some` call the function property `some`.
   * If `Option` is `None` call the function property `none`.
   * @example
   * let value = 0;
   * const none = None<number>();
   * none.match({
   *   some: (v) => {
   *     value = v;
   *   },
   *   none: () => {
   *     value = 2;
   *   },
   * });
   * expect(value).toBe(2);
   * 
   * value = 0;
   * const some = Some(1);
   * some.match({
   *   some: (v) => {
   *     value = v;
   *   },
   *   none: () => {
   *     value = 2;
   *   },
   * });
   * expect(value).toBe(1);
   */
  match(arms: {
    some: (value: T) => unknown,
    none: () => unknown,
  }): void {
    if (this.is_none()) {
      arms.none();
      return;
    }
    arms.some(this[value_symbol]);
  }
}

/**
 * Creates a `Some` type `Option`
 */
export const Some = Option.Some;

/**
 * Creates a `None` type `Option`
 */
export const None = Option.None;
