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

  is_some(): boolean {
    return this.type == EType.Some;
  }

  is_none(): boolean {
    return this.type == EType.None;
  }

  inspect(func: (value: T) => unknown): this {
    if (!this.is_some()) return this;
    func(this.value);
    return this;
  }

  or(optb: Option<T>): Option<T> {
    if (this.is_some()) {
      return this;
    }
    if (optb.is_some()) {
      return optb;
    }
    return Option.None();
  }

  or_else(func: () => Option<T>): Option<T> {
    if (this.is_some()) {
      return this;
    }
    return func();
  }

  xor(optb: Option<T>): Option<T> {
    if (this.is_some()) {
      if (optb.is_some()) {
        return Option.None();
      }
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
    this.value = null as any;
    this.type = EType.None;
    return Option.Some(value);
  }

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
}

export const Some = Option.Some;

export const None = Option.None;
