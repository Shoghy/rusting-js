import { None, Option, Some } from "./option";

enum EType {
  Ok,
  Err,
}

export class Result<T, E> {
  private type: EType;
  private value!: T | E;

  private constructor(type: EType) {
    this.type = type;
  }

  static Ok<T, E = unknown>(value: T): Result<T, E> {
    const self = new Result<T, E>(EType.Ok);
    self.value = value;
    return self;
  }

  static Err<E, T = unknown>(value: E): Result<T, E> {
    const self = new Result<T, E>(EType.Err);
    self.value = value;
    return self;
  }

  is_ok(): boolean {
    return this.type === EType.Ok;
  }

  is_err(): boolean {
    return this.type === EType.Err;
  }

  inspect(func: (ok: T) => unknown): this {
    if (this.is_err()) return this;
    func(this.value as T);
    return this;
  }

  inspect_err(func: (err: E) => unknown): this {
    if (this.is_ok()) return this;
    func(this.value as E);
    return this;
  }

  and<U>(res: Result<U, E>) {
    if (this.is_err()) {
      return this;
    }
    return res;
  }

  and_then<U>(func: (value: T) => Result<U, E>) {
    if (this.is_err()) {
      return this;
    }
    return func(this.value as T);
  }

  err(): Option<E> {
    if (this.is_ok()) {
      return None();
    }
    return Some(this.value as E);
  }

  expect(value: string): T {
    if (this.is_ok()) {
      return this.value as T;
    }
    throw new Error(value);
  }

  expect_err(value: string): E {
    if (this.is_err()) {
      return this.value as E;
    }
    throw new Error(value);
  }

  is_err_and(func: (err: E) => boolean): boolean {
    if (this.is_ok()) {
      return false;
    }
    return func(this.value as E);
  }

  is_ok_and(func: (ok: T) => boolean): boolean {
    if (this.is_err()) {
      return false;
    }
    return func(this.value as T);
  }

  map<U>(func: (ok: T) => Result<U, E>) {
    if (this.is_err()) {
      return this;
    }
    return func(this.value as T);
  }

  map_err<F>(func: (err: E) => Result<T, F>) {
    if (this.is_ok()) {
      return this;
    }
    return func(this.value as E);
  }

  map_or<U>(def: U, func: (ok: T) => U): U {
    if (this.is_err()) {
      return def;
    }
    return func(this.value as T);
  }

  map_or_else<U>(err_func: (err: E) => U, ok_func: (ok: T) => U): U {
    if (this.is_err()) {
      return err_func(this.value as E);
    }
    return ok_func(this.value as T);
  }

  ok(): Option<T> {
    if (this.is_err()) {
      return None();
    }
    return Some(this.value as T);
  }

  or<F>(res: Result<T, F>) {
    if (this.is_ok()) {
      return this;
    }
    return res;
  }

  or_else<F>(op: (err: E) => Result<T, F>) {
    if (this.is_ok()) {
      return this;
    }
    return op(this.value as E);
  }

  unwrap(): T {
    if (this.is_ok()) {
      return this.value as T;
    }
    throw new Error("`Result` is Err");
  }

  unwrap_err(): E {
    if (this.is_err()) {
      return this.value as E;
    }

    throw new Error("`Result` is Ok");
  }

  unwrap_or(def: T): T {
    if (this.is_ok()) {
      return this.value as T;
    }
    return def;
  }

  unwrap_or_else(func: (err: E) => T): T {
    if (this.is_ok()) {
      return this.value as T;
    }
    return func(this.value as E);
  }

  to_string(): string {
    if (this.is_ok()) {
      return `Ok(${this.value})`;
    }
    return `Err(${this.value})`;
  }

  is_equal_to(other: Result<T, E>): boolean {
    if(this.type !== other.type){
      return false;
    }
    return this.value === other.value;
  }
}

export const Ok = Result.Ok;

export const Err = Result.Err;