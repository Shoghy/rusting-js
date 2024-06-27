import { None, type Option, Some } from "./option";
import { panic } from "./panic";

enum EType {
  Ok,
  Err,
}

const type_symbol = Symbol("type");
const value_symbol = Symbol("value");

export class Result<T, E> {
  private [type_symbol]: EType;
  private [value_symbol]!: T | E;

  private constructor(type: EType) {
    this[type_symbol] = type;
  }

  /**
   * Creates a `Ok` type `Result`
   */
  static Ok<T, E = unknown>(value: T): Result<T, E> {
    const self = new Result<T, E>(EType.Ok);
    self[value_symbol] = value;
    return self;
  }

  /**
   * Creates a `Err` type `Result`
   */
  static Err<E, T = unknown>(value: E): Result<T, E> {
    const self = new Result<T, E>(EType.Err);
    self[value_symbol] = value;
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
    return this[type_symbol] === EType.Ok;
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
    return this[type_symbol] === EType.Err;
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
    func(this[value_symbol] as T);
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
    func(this[value_symbol] as E);
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
      return Err(this[value_symbol] as E);
    }
    return res;
  }

  /**
   * If `Result` is `Ok` execute the `func` parameter and returns its return value,
   * otherwise it just return `Err`
   * @example
   * const ok = Ok(5);
   * const result1 = ok.and_then((value) => {
   *   return Ok(value * value);
   * });
   * expect(result1).toEqual(Ok(25));
   * 
   * const err = Err<number, number>(7);
   * const result2 = err.and_then((value) => {
   *   return Ok(value*value);
   * });
   * expect(result2).toEqual(Err(7));
   */
  and_then<U>(func: (value: T) => Result<U, E>): Result<U, E> {
    if (this.is_err()) {
      return Err(this[value_symbol] as E);
    }
    return func(this[value_symbol] as T);
  }

  /**
   * If `Result` is `Err` the wrapped value of `Err` wrapped on a `Some`,
   * if `Result` is `Ok` returns `None`
   * @example
   * const ok = Ok("You're cute");
   * expect(ok.err()).toEqual(None());
   * 
   * const err = Err(new Error("EEEERRRROOORRRR"));
   * expect(err.err()).toEqual(Some(new Error("EEEERRRROOORRRR")));
   */
  err(): Option<E> {
    if (this.is_ok()) {
      return None();
    }
    return Some(this[value_symbol] as E);
  }

  /**
   * If `Result` is `Ok` returns its wrapped value,
   * if `Result` is `Err` panics with the message given
   * in the `value` parameter
   * @example
   * const msg = "I am am error message, I am here to tell you what went wrong.";
   * 
   * const ok = Ok("Minecraft");
   * expect(ok.expect(msg)).toBe("Minecraft");
   * 
   * const err = Err("Also try Terraria");
   * expect(() => err.expect(msg)).toThrowError(msg);
   */
  expect(value: string): T {
    if (this.is_ok()) {
      return this[value_symbol] as T;
    }
    panic(value);
  }

  /**
   * If `Result` is `Err` return its wrapped value,
   * if `REsult` is `Ok` panics with the message given
   * in the `value` parameter
   * @example
   * const msg = "Did I do a good job?";
   * 
   * const ok = Ok("Terraria");
   * expect(() => ok.expect_err(msg)).toThrowError(msg);
   * 
   * const err = Err("Also try Minecraft");
   * expect(err.expect_err(msg)).toBe("Also try Minecraft");
   */
  expect_err(value: string): E {
    if (this.is_err()) {
      return this[value_symbol] as E;
    }
    panic(value);
  }

  /**
   * If `Result` is `Ok` returns `false`, otherwise
   * execute the `func` parameter and return its returned value
   * @example
   * const r_true = () =>  true;
   * const r_false = () => false;
   * 
   * const ok = Ok("Why are you reading this?");
   * expect(ok.is_err_and(r_true)).toBeFalse();
   * expect(ok.is_err_and(r_false)).toBeFalse();
   * 
   * const err = Err(7);
   * expect(err.is_err_and(r_true)).toBeTrue();
   * expect(err.is_err_and(r_false)).toBeFalse();
   * expect(err.is_err_and((val) => val === 7)).toBeTrue();
   * expect(err.is_err_and((val) => val === 8)).toBeFalse();
   */
  is_err_and(func: (err: E) => boolean): boolean {
    if (this.is_ok()) {
      return false;
    }
    return func(this[value_symbol] as E);
  }

  is_ok_and(func: (ok: T) => boolean): boolean {
    if (this.is_err()) {
      return false;
    }
    return func(this[value_symbol] as T);
  }

  map<U>(func: (ok: T) => U): Result<U, E> {
    if (this.is_err()) {
      return Err(this[value_symbol] as E);
    }
    return Ok(func(this[value_symbol] as T));
  }

  map_err<F>(func: (err: E) => F): Result<T, F> {
    if (this.is_ok()) {
      return Ok(this[value_symbol] as T);
    }
    return Err(func(this[value_symbol] as E));
  }

  map_or<U>(def: U, func: (ok: T) => U): U {
    if (this.is_err()) {
      return def;
    }
    return func(this[value_symbol] as T);
  }

  map_or_else<U>(arms: {
    ok: (value: T) => U,
    err: (value: E) => U,
  }): U {
    if (this.is_err()) {
      return arms.err(this[value_symbol] as E);
    }
    return arms.ok(this[value_symbol] as T);
  }

  ok(): Option<T> {
    if (this.is_err()) {
      return None();
    }
    return Some(this[value_symbol] as T);
  }

  or<F>(res: Result<T, F>): Result<T, F> {
    if (this.is_ok()) {
      return Ok(this[value_symbol] as T);
    }
    return res;
  }

  or_else<F>(op: (err: E) => Result<T, F>): Result<T, F> {
    if (this.is_ok()) {
      return Ok(this[value_symbol] as T);
    }
    return op(this[value_symbol] as E);
  }

  unwrap(): T {
    if (this.is_ok()) {
      return this[value_symbol] as T;
    }
    panic("Called `unwrap` method on a `Err`");
  }

  unwrap_err(): E {
    if (this.is_err()) {
      return this[value_symbol] as E;
    }
    panic("Called `unwrap_err` method on a `Ok`");
  }

  unwrap_or(def: T): T {
    if (this.is_ok()) {
      return this[value_symbol] as T;
    }
    return def;
  }

  unwrap_or_else(func: (err: E) => T): T {
    if (this.is_ok()) {
      return this[value_symbol] as T;
    }
    return func(this[value_symbol] as E);
  }

  toString(): string {
    if (this.is_ok()) {
      return `Ok(${this[value_symbol]})`;
    }
    return `Err(${this[value_symbol]})`;
  }

  is_equal_to(other: Result<T, E>): boolean {
    if (this[type_symbol] !== other[type_symbol]) {
      return false;
    }
    return this[value_symbol] === other[value_symbol];
  }

  match(arms: {
    ok: (value: T) => unknown,
    err: (err: E) => unknown,
  }): void {
    if (this.is_err()) {
      arms.err(this[value_symbol] as E);
      return;
    }
    arms.ok(this[value_symbol] as T);
  }

  if_ok(func: (value: T) => unknown): void {
    if (this.is_err()) {
      return;
    }
    func(this[value_symbol] as T);
  }

  if_err(func: (value: E) => unknown): void {
    if (this.is_ok()) {
      return;
    }
    func(this[value_symbol] as E);
  }
}

/**
 * Creates a `Ok` type `Result`
 */
export const Ok = Result.Ok;

/**
 * Creates a `Err` type `Result`
 */
export const Err = Result.Err;