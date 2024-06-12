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

  and<U>(optb: Option<U>): Option<U> {
    if (this.is_some() && optb.is_some()) {
      return optb;
    }
    return Option.None();
  }

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

  get_or_insert(value: T): T {
    if (this.is_none()) {
      this.value = value;
      this.type = EType.Some;
    }
    return this.value;
  }

  get_or_insert_with(func: () => T): T {
    if (this.is_none()) {
      this.value = func();
      this.type = EType.Some;
    }
    return this.value;
  }

  insert(value: T): T {
    this.value = value;
    this.type = EType.Some;
    return this.value;
  }

  is_some_and(func: (value: T) => boolean): boolean {
    if (this.is_none()) {
      return false;
    }
    return func(this.value);
  }

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

  unwrap_or(value: T): T {
    if (this.is_some()) {
      return this.value;
    }
    return value;
  }

  unwrap_or_else(func: () => T): T {
    if (this.is_some()) {
      return this.value;
    }
    return func();
  }

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
}

export const Some = Option.Some;

export const None = Option.None;
