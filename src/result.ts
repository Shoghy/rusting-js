import { None, type Option, Some } from "./option";
import { panic } from "./panic";

enum EType {
  Ok,
  Err,
}

export class Result<T, E> {
  private __type: EType;
  private __value!: T | E;

  private constructor(type: EType) {
    this.__type = type;
  }

  static Ok<T, E = unknown>(value: T): Result<T, E> {
    const self = new Result<T, E>(EType.Ok);
    self.__value = value;
    return self;
  }

  static Err<E, T = unknown>(value: E): Result<T, E> {
    const self = new Result<T, E>(EType.Err);
    self.__value = value;
    return self;
  }

  /**
   * Returns true if `Result` is type of `Ok`
   * @example
   * const ok = Ok(1);
   * expect(ok.is_ok()).toBeTrue();
   * 
   * const err = Err(2);
   * expect(err.is_ok()).toBeFalse();
   */
  is_ok(): boolean {
    return this.__type === EType.Ok;
  }

  /**
   * Returns true if `Result` is type of `Err`
   * @example
   * const ok = Ok(1);
   * expect(ok.is_err()).toBeFalse();
   * 
   * const err = Err(2);
   * expect(err.is_err()).toBeTrue();
   */
  is_err(): boolean {
    return this.__type === EType.Err;
  }

  /**
   * Execute the `func` parameter if `Result` is `Ok`
   * @example
   * const ok = Ok("Hola");
   * ok.inspect((value) => {
   *   expect(value).toBe("Hola");
   * });
   * 
   * const err = Err("Mundo");
   * err.inspect(() => {
   *   unreachable();
   * });
   */
  inspect(func: (ok: T) => unknown): this {
    if (this.is_err()) return this;
    func(this.__value as T);
    return this;
  }

  /**
   * Execute the `func` parameter if `Result` is `Err`
   * @example
   * const ok = Ok(2);
   * ok.inspect_err(() => {
   *   unreachable();
   * });
   * 
   * const err = Err(4);
   * err.inspect_err((value) => {
   *   expect(value).toBe(4);
   * });
   */
  inspect_err(func: (err: E) => unknown): this {
    if (this.is_ok()) return this;
    func(this.__value as E);
    return this;
  }

  /**
   * Returns `this` if it is `Err`, otherwise return `res`
   * @example
   * let val1 = Ok<string, number>("Bill Cipher");
   * let val2 = Err<number, string>(10);
   * expect(val1.and(val2)).toEqual(Err(10));
   * 
   * val1 = Err(3);
   * val2 = Ok("Gideon");
   * expect(val1.and(val2)).toEqual(Err(3));
   * 
   * val1 = Ok("Stan Lee");
   * val2 = Ok("Stan Ford");
   * expect(val1.and(val2)).toEqual(Ok("Stan Ford"));
   * 
   * val1 = Err(1);
   * val2 = Err(2);
   * expect(val1.and(val2)).toEqual(Err(1));
   */
  and<U>(res: Result<U, E>): Result<U, E> {
    if (this.is_err()) {
      return Err(this.__value as E);
    }
    return res;
  }

  and_then<U>(func: (value: T) => Result<U, E>): Result<U, E> {
    if (this.is_err()) {
      return Err(this.__value as E);
    }
    return func(this.__value as T);
  }

  err(): Option<E> {
    if (this.is_ok()) {
      return None();
    }
    return Some(this.__value as E);
  }

  expect(value: string): T {
    if (this.is_ok()) {
      return this.__value as T;
    }
    panic(value);
  }

  expect_err(value: string): E {
    if (this.is_err()) {
      return this.__value as E;
    }
    panic(value);
  }

  is_err_and(func: (err: E) => boolean): boolean {
    if (this.is_ok()) {
      return false;
    }
    return func(this.__value as E);
  }

  is_ok_and(func: (ok: T) => boolean): boolean {
    if (this.is_err()) {
      return false;
    }
    return func(this.__value as T);
  }

  map<U>(func: (ok: T) => U): Result<U, E> {
    if (this.is_err()) {
      return Err(this.__value as E);
    }
    return Ok(func(this.__value as T));
  }

  map_err<F>(func: (err: E) => F): Result<T, F> {
    if (this.is_ok()) {
      return Ok(this.__value as T);
    }
    return Err(func(this.__value as E));
  }

  map_or<U>(def: U, func: (ok: T) => U): U {
    if (this.is_err()) {
      return def;
    }
    return func(this.__value as T);
  }

  map_or_else<U>(err_func: (err: E) => U, ok_func: (ok: T) => U): U {
    if (this.is_err()) {
      return err_func(this.__value as E);
    }
    return ok_func(this.__value as T);
  }

  ok(): Option<T> {
    if (this.is_err()) {
      return None();
    }
    return Some(this.__value as T);
  }

  or<F>(res: Result<T, F>): Result<T, F> {
    if (this.is_ok()) {
      return Ok(this.__value as T);
    }
    return res;
  }

  or_else<F>(op: (err: E) => Result<T, F>): Result<T, F> {
    if (this.is_ok()) {
      return Ok(this.__value as T);
    }
    return op(this.__value as E);
  }

  unwrap(): T {
    if (this.is_ok()) {
      return this.__value as T;
    }
    panic("Called `unwrap` method on a `Err`");
  }

  unwrap_err(): E {
    if (this.is_err()) {
      return this.__value as E;
    }
    panic("Called `unwrap_err` method on a `Ok`");
  }

  unwrap_or(def: T): T {
    if (this.is_ok()) {
      return this.__value as T;
    }
    return def;
  }

  unwrap_or_else(func: (err: E) => T): T {
    if (this.is_ok()) {
      return this.__value as T;
    }
    return func(this.__value as E);
  }

  toString(): string {
    if (this.is_ok()) {
      return `Ok(${this.__value})`;
    }
    return `Err(${this.__value})`;
  }

  is_equal_to(other: Result<T, E>): boolean {
    if (this.__type !== other.__type) {
      return false;
    }
    return this.__value === other.__value;
  }

  match(arms: {
    ok: (value: T) => unknown,
    err: (err: E) => unknown,
  }): void {
    if (this.is_err()) {
      arms.err(this.__value as E);
      return;
    }
    arms.ok(this.__value as T);
  }

  if_ok(func: (value: T) => unknown): void {
    if (this.is_err()) {
      return;
    }
    func(this.__value as T);
  }

  if_err(func: (value: E) => unknown): void {
    if (this.is_ok()) {
      return;
    }
    func(this.__value as E);
  }
}

export const Ok = Result.Ok;

export const Err = Result.Err;