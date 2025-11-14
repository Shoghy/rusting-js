import { panic } from "../panic.ts";
import type { TryStatic } from "../traits/try_trait.ts";
import { StaticImplements } from "../utils.ts";
import { None, type Option, Some } from "./option.ts";
import { EnumClass } from "./enum.ts";
import { ControlFlow } from "./control_flow.ts";

@StaticImplements<TryStatic<unknown, Result<unknown, unknown>>>()
export class Result<T, E> extends EnumClass<{ Ok: T; Err: E }> {
  isValidType(type: "Ok" | "Err"): boolean {
    switch (type) {
      case "Ok":
      case "Err":
        return true;
    }

    return false;
  }

  static fromOutput<T, E>(output: T): Result<T, E> {
    return Ok(output);
  }

  branch(): ControlFlow<Result<T, E>, T> {
    return this.match({
      Ok: (v) => ControlFlow.Continue(v),
      Err: (e) => ControlFlow.Break(Err(e)),
    });
  }

  /**
   * Creates a `Ok` type `Result`
   */
  static Ok<E>(): Result<void, E>;
  static Ok<T, E>(value: T): Result<T, E>;
  static Ok<T, E>(value?: T): Result<T, E> {
    return new Result<T, E>("Ok", value as T);
  }

  /**
   * Creates a `Err` type `Result`
   */
  static Err<T, E>(value: E): Result<T, E> {
    return new Result<T, E>("Err", value);
  }

  /**
   * Returns true if `Result` is type of `Ok`
   * @example
   * const ok = Ok(1);
   * expect(ok.isOk()).toBeTrue();
   *
   * const err = Err(2);
   * expect(err.isOk()).toBeFalse();
   */
  isOk(): boolean {
    return this.is("Ok");
  }

  /**
   * Returns true if `Result` is type of `Err`
   * @example
   * const ok = Ok(1);
   * expect(ok.isErr()).toBeFalse();
   *
   * const err = Err(2);
   * expect(err.isErr()).toBeTrue();
   */
  isErr(): boolean {
    return this.is("Err");
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
    this.ifOk(func);
    return this;
  }

  /**
   * Execute the `func` parameter if `Result` is `Err`
   * @example
   * const ok = Ok(2);
   * ok.inspectErr(() => {
   *   unreachable();
   * });
   *
   * const err = Err(4);
   * err.inspectErr((value) => {
   *   expect(value).toBe(4);
   * });
   */
  inspectErr(func: (err: E) => unknown): this {
    this.ifErr(func);
    return this;
  }

  /**
   * Returns `this` if it is `Err`, otherwise return `res`
   * @example
   * let val1 = Ok<string, number>("Bill Cipher");
   * let val2 = Err<string, number>(10);
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
    return this.match({
      Ok: () => res,
      Err: (e) => Err(e),
    });
  }

  /**
   * If `Result` is `Ok` execute the `func` parameter and returns its return value,
   * otherwise it just return `Err`
   * @example
   * const ok = Ok(5);
   * const result1 = ok.andThen((value) => {
   *   return Ok(value * value);
   * });
   * expect(result1).toEqual(Ok(25));
   *
   * const err = Err<number, number>(7);
   * const result2 = err.andThen((value) => {
   *   return Ok(value*value);
   * });
   * expect(result2).toEqual(Err(7));
   */
  andThen<U>(func: (value: T) => Result<U, E>): Result<U, E> {
    return this.match({
      Ok: (t) => func(t),
      Err: (e) => Err(e),
    });
  }

  /**
   * If `Result` is `Err` the wrapped value of `Err` wrapped on a `Some`,
   * if `Result` is `Ok` returns `None`
   * @example
   * const ok = Ok("You're cute");
   * expect(ok.err()).toEqual(None());
   *
   * const err = Err(new Error("EEEEEERRRRROOOOORRR"));
   * expect(err.err()).toEqual(Some(new Error("EEEEEERRRRROOOOORRR")));
   */
  err(): Option<E> {
    return this.match({
      Ok: () => None(),
      Err: (x) => Some(x),
    });
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
    return this.match({
      Ok: (t) => t,
      Err: () => panic(value),
    });
  }

  /**
   * If `Result` is `Err` return its wrapped value,
   * if `REsult` is `Ok` panics with the message given
   * in the `value` parameter
   * @example
   * const msg = "Did I do a good job?";
   *
   * const ok = Ok("Terraria");
   * expect(() => ok.expectErr(msg)).toThrowError(msg);
   *
   * const err = Err("Also try Minecraft");
   * expect(err.expectErr(msg)).toBe("Also try Minecraft");
   */
  expectErr(value: string): E {
    return this.match({
      Ok: () => panic(value),
      Err: (e) => e,
    });
  }

  /**
   * If `Result` is `Ok` returns `false`, otherwise
   * execute the `func` parameter and return its returned value
   * @example
   * const rTrue = () =>  true;
   * const rFalse = () => false;
   *
   * const ok = Ok("Why are you reading this?");
   * expect(ok.isErrAnd(rTrue)).toBeFalse();
   * expect(ok.isErrAnd(rFalse)).toBeFalse();
   *
   * const err = Err(7);
   * expect(err.isErrAnd(rTrue)).toBeTrue();
   * expect(err.isErrAnd(rFalse)).toBeFalse();
   * expect(err.isErrAnd((val) => val === 7)).toBeTrue();
   * expect(err.isErrAnd((val) => val === 8)).toBeFalse();
   */
  isErrAnd(func: (err: E) => boolean): boolean {
    return this.match({
      Ok: () => false,
      Err: (e) => func(e),
    });
  }

  /**
   * If `Result` is `Err` returns false, otherwise execute
   * the `fun` parameter and return its returned value.
   * @example
   * const rTrue = () => true;
   * const rFalse = () => false;
   *
   * const ok = Ok(1);
   * expect(ok.isOkAnd(rTrue)).toBeTrue();
   * expect(ok.isOkAnd(rFalse)).toBeFalse();
   * expect(ok.isOkAnd((val) => val === 1)).toBeTrue();
   * expect(ok.isOkAnd((val) => val === 2)).toBeFalse();
   *
   * const err = Err(2);
   * expect(err.isOkAnd(rTrue)).toBeFalse();
   * expect(err.isOkAnd(rFalse)).toBeFalse();
   */
  isOkAnd(func: (ok: T) => boolean): boolean {
    return this.match({
      Ok: (t) => func(t),
      Err: () => false,
    });
  }

  /**
   * If `Result` is an `Ok` it will execute the `func`
   * parameter and return its returned value wrapped in
   * a `Ok`, otherwise just return `Err`.
   * @example
   * const ok = Ok("Hello ");
   * const result1 = ok.map((val) => val+"World!");
   * expect(result1).toEqual(Ok("Hello World!"));
   *
   * const err = Err(new Error("Hey"));
   * const result2 = err.map(() => 1);
   * expect(result2).toEqual(Err(new Error("Hey")));
   */
  map<U>(func: (ok: T) => U): Result<U, E> {
    return this.match({
      Ok: (t) => Ok(func(t)),
      Err: (e) => Err(e),
    });
  }

  /**
   * If `Result` is `Err` execute the `func` parameter
   * and return its returned value wrapped in a `Err`,
   * otherwise just returns `Ok`
   * @example
   * const ok = Ok(99);
   * const result1 = ok.mapErr(() => 7);
   * expect(result1).toEqual(Ok(99));
   *
   * const err = Err(8);
   * const return2 = err.mapErr((val) => val*9);
   * expect(return2).toEqual(Err(72));
   */
  mapErr<F>(func: (err: E) => F): Result<T, F> {
    return this.match({
      Ok: (t) => Ok(t),
      Err: (e) => Err(func(e)),
    });
  }

  /**
   * If `Result` is `Ok`, it will call the `func` parameter
   * and return its returned value, otherwise it will return
   * the `def` parameter.
   * @example
   * const ok = Ok("Nih");
   * const result1 = ok.mapOr("Python", (val) => `Knights who say ${val}`);
   * expect(result1).toBe("Knights who say Nih");
   *
   * const err = Err(12);
   * const result2 = err.mapOr("Default value", () => "Not default value");
   * expect(result2).toBe("Default value");
   */
  mapOr<U>(def: U, func: (ok: T) => U): U {
    return this.match({
      Ok: (t) => func(t),
      Err: () => def,
    });
  }

  /**
   * @example
   * const ok = Ok("eggIrl");
   * const result1 = ok.mapOrElse(
   *   () => unreachable(),
   *   (val) => `r/${val}`,
   * );
   * expect(result1).toBe("r/eggIrl");
   *
   * const err = Err("Celeste");
   * const result2 = err.mapOrElse(
   *   (val) => `${val}: Madeline`,
   *   () => unreachable(),
   * );
   * expect(result2).toBe("Celeste: Madeline");
   */
  mapOrElse<U>(def: (e: E) => U, f: (t: T) => U): U {
    return this.match({
      Ok: (t) => f(t),
      Err: (e) => def(e),
    });
  }

  /**
   * If `Result` is `Ok` return its value wrapped in a `Some`,
   * otherwise returns `None`.
   * @example
   * const ok = Ok(32);
   * expect(ok.ok()).toEqual(Some(32));
   *
   * const err = Err("lmao");
   * expect(err.ok()).toEqual(None());
   */
  ok(): Option<T> {
    return this.match({
      Ok: (t) => Some(t),
      Err: () => None(),
    });
  }

  /**
   * If `this` is `Ok`, returns its value wrapped in a new `Ok`,
   * otherwise, returns the `res` parameter.
   * @example
   * let val1 = Ok<number, string>(21);
   * let val2 = Err<number, string>("This should be an error message");
   * expect(val1.or(val2)).toEqual(Ok(21));
   *
   * val1 = Err("Another error message");
   * val2 = Ok(44);
   * expect(val1.or(val2)).toEqual(Ok(44));
   *
   * val1 = Ok(85);
   * val2 = Ok(333);
   * expect(val1.or(val2)).toEqual(Ok(85));
   *
   * val1 = Err("Yet another error message");
   * val2 = Err("-Error message enthusiast");
   * expect(val1.or(val2)).toEqual(Err("-Error message enthusiast"));
   */
  or<F>(res: Result<T, F>): Result<T, F> {
    return this.match({
      Ok: (v) => Ok(v),
      Err: () => res,
    });
  }

  /**
   * If `this` is `Ok`, return its value wrapped in a new `Ok`,
   * otherwise execute the `op` parameter and return its
   * returned value.
   * @example
   * const ok = Ok("The same value");
   * const result1 = ok.orElse(() => Ok("Another value"));
   * expect(result1).toEqual(Ok("The same value"));
   *
   * const err = Err("Value");
   * const result2 = err.orElse((val) => Err(`Another ${val}`));
   * expect(result2).toEqual(Err("Another Value"));
   */
  orElse<F>(op: (err: E) => Result<T, F>): Result<T, F> {
    return this.match({
      Ok: (t) => Ok(t),
      Err: (e) => op(e),
    });
  }

  /**
   * If `Result` is `Ok` returns its wrapped value, if
   * it is `Err` panics
   * @throws {Error}
   * @example
   * const ok = Ok(0);
   * expect(ok.unwrap()).toBe(0);
   *
   * const err = Err(777);
   * expect(() => err.unwrap()).toThrowError("Called `unwrap` method on a `Err`");
   */
  unwrap(): T {
    return this.match({
      Ok: (t) => t,
      Err: () => panic("Called `unwrap` method on a `Err`"),
    });
  }

  /**
   * If `Result` is `Err` returns its wrapped value,
   * if it is `Ok` panics
   * @throws {Error}
   * @example
   * const ok = Ok("Never");
   * expect(() => ok.unwrapErr()).toThrowError("Called `unwrapErr` method on a `Ok`");
   *
   * const err = Err("Gonna");
   * expect(err.unwrapErr()).toBe("Gonna");
   */
  unwrapErr(): E {
    return this.match({
      Ok: () => panic("Called `unwrapErr` method on a `Ok`"),
      Err: (e) => e,
    });
  }

  /**
   * If `Result` is `Ok` return its wrapped value,
   * if it is `Err` return the `def` parameter
   * @example
   * const ok = Ok(-37);
   * expect(ok.unwrapOr(74)).toBe(-37);
   *
   * const err = Err<number[], number[]>([1, 2, 3]);
   * expect(err.unwrapOr([4, 5, 6])).toEqual([4, 5, 6]);
   */
  unwrapOr(def: T): T {
    return this.match({
      Ok: (t) => t,
      Err: () => def,
    });
  }

  /**
   * If `Result` is `Ok` return its wrapped value,
   * otherwise execute the `func` parameter and
   * return its returned value.
   * @example
   * const ok = Ok("Returned");
   * expect(ok.unwrapOrElse(() =>  "Not Returned")).toBe("Returned");
   *
   * const err = Err(5);
   * expect(err.unwrapOrElse((val) => val*3)).toBe(15);
   */
  unwrapOrElse(func: (err: E) => T): T {
    return this.match({
      Ok: (t) => t,
      Err: (e) => func(e),
    });
  }

  /**
   * If `Result` is `Ok` execute the `func parameter`
   * @example
   * let value = 0;
   * const ok = Ok(32);
   * ok.ifOk((val) => {
   *   value = val;
   * });
   * expect(value).toBe(32);
   *
   * const err = Err(64);
   * err.ifOk(() => {
   *   throw new Error("This will not be executed");
   * });
   */
  ifOk(func: (value: T) => void): void {
    this.ifIs("Ok", func);
  }

  /**
   * If `Result` is `Err` execute the `func` parameter
   * @example
   * const ok = Ok(57);
   * ok.ifErr(() => {
   *   throw new Error("This will not be executed");
   * });
   *
   * let value = 0;
   * const err = Err(39);
   * err.ifErr((val) => {
   *   value = val;
   * });
   * expect(value).toBe(39);
   */
  ifErr(func: (value: E) => void): void {
    this.ifIs("Err", func);
  }

  /**
   * If `Ok` its wrapped value is returned.
   *
   * If `Err` its wrapped value is thrown.
   *
   * @throws {E}
   * @example
   * const ok = Ok<string, Error>("Will not throw");
   * const result1 = catchUnwind(() => {
   *   const val = ok.throw();
   *   expect(val).toBe("Will not throw");
   *   return val;
   * });
   * expect(result1).toEqual(ok);
   *
   * const err = Err<string, Error>(new Error("Will throw"));
   * const result2 = catchUnwind(() => {
   *   const val = err.throw();
   *   done("This will never execute");
   *   return val;
   * });
   * expect(result2).toEqual(err);
   * done();
   */
  throw(): T {
    return this.match({
      Ok: (value) => value,
      Err: (error) => {
        throw error;
      },
    });
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
