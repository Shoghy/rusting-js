import { Err, Ok, type Result } from "./result";

enum EType {
  Some,
  None,
}

export class Option<T> {
  private value!: T;
  private type: EType;

  private constructor(type: EType) {
    this.type = type;
  }

  static Some<T>(value: T): Option<T> {
    const self = new Option<T>(EType.Some);
    self.value = value;
    return self;
  }

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
    return this.type === EType.Some;
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
    return this.type === EType.None;
  }

  /**
   * Execute the `func` parameter if `Option` is `Some`
   * @example
   * const some = Some([1, 2, 3, 4]);
   * some.inspect((value) => {
   *   value.forEach((v) => {
   *     console.log(v);
   *   });
   * }); // This will print `1, 2, 3, 4` in the console
   *
   * const none = None<number[]>();
   * none.inspect((value) => {
   *   value.forEach((v) => {
   *     console.log(v);
   *   });
   * }); // This will print nothing
   */
  inspect(func: (value: T) => unknown): this {
    if (!this.is_some()) return this;
    func(this.value);
    return this;
  }

  /**
   * Returns `this` if is `Some` or return `optb` if is `Some`, returns `None` if both are `None`
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
    if (optb.is_some()) {
      return optb;
    }
    return Option.None();
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
   * const result2 = val.or_else(() => {
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
      return Option.None();
    }
    if (this.is_some()) {
      return this;
    }
    if (optb.is_some()) {
      return optb;
    }
    return Option.None();
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
    return Option.None();
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
      return func(this.value);
    }
    return Option.None();
  }

  /**
   * Returns the `value` contained in `Some`.
   * @throws {Error}
   * If `Option` is `None` throws an error with the message specified.
   * @example
   * const none = None();
   * const msg = "This should throw an exception";
   * expect(() => none.expect(msg)).toThrow(new Error(msg));
   *
   * const some = Some(1);
   * const val = some.expect("This should not throw an error");
   * expect(val).toBe(1);
   */
  expect(msg: string): T {
    if (this.is_some()) {
      return this.value;
    }
    throw new Error(msg);
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
      this.value = value;
      this.type = EType.Some;
    }
    return this.value;
  }

  /**
   * If `Option` is `None` execute the `func` parameter and insert its returned value in `Option` then return the inserted value. If `Option` is `Some` it just return its value.
   * @example
   * const option1 = None<string[]>();
   * const result1 = option1.get_or_insert_with(
   *   () => Array.from("Hello World!")
   * );
   * expect(result1).toEqual(Array.from("Hello World!"));
   * expect(option1).toEqual(Some(Array.from("Hello World!")));
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
      this.value = func();
      this.type = EType.Some;
    }
    return this.value;
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
    this.value = value;
    this.type = EType.Some;
    return this.value;
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
    return func(this.value);
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
      return Option.None();
    }
    const value = this.value;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (this as any).value;
    this.type = EType.None;
    return Option.Some(value);
  }

  /**
   * Returns the `value` contained in `Some`.
   * @throws {Error}
   * If `Option` is `None` throws an error.
   * @example
   * const none = None();
   * expect(() => none.unwrap()).toThrow(new Error("`Option` is None"));
   *
   * const some = Some(1);
   * const val = some.unwrap();
   * expect(val).toBe(1);
   */
  unwrap(): T {
    if (this.is_some()) {
      return this.value;
    }
    throw new Error("`Option` is None");
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
      return this.value;
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
      return this.value;
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
      return Option.None();
    }
    return Option.Some([this.value, other.value]);
  }

  to_string(): string {
    if (this.is_some()) {
      return `Some(${this.value})`;
    }
    return "None";
  }

  is_equal_to(other: Option<T>): boolean {
    if (this.type !== other.type) {
      return false;
    }
    if (this.type === EType.None) {
      return true;
    }
    return this.value === other.value;
  }

  map<U>(func: (value: T) => U): Option<U>{
    if(this.is_none()){
      return None();
    }
    return Some(func(this.value));
  }

  map_or<U>(def: U, func: (value: T) => U): U{
    if(this.is_none()){
      return def;
    }
    return func(this.value);
  }

  map_or_else<U>(none_func: () => U, some_func: (value: T) => U): U{
    if(this.is_none()){
      return none_func();
    }
    return some_func(this.value);
  }

  ok_or<E>(err: E): Result<T, E>{
    if(this.is_none()){
      return Err(err);
    }
    return Ok(this.value);
  }

  ok_or_else<E>(func: () => E): Result<T, E>{
    if(this.is_some()){
      return Ok(this.value);
    }
    return Err(func());
  }

  unwrap_unchecked(): T | undefined{
    return this.value;
  }
}

export const Some = Option.Some;

export const None = Option.None;
