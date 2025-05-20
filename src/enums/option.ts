import { Enum } from "./enum.ts";
import { ControlFlow } from "./control_flow.ts";
import { panic } from "../panic.ts";
import { Err, Ok, type Result } from "./result.ts";
import type { TryStatic } from "../traits/try_trait.ts";
import { StaticImplements } from "../utils.ts";

@StaticImplements<TryStatic<unknown, Option<unknown>>>()
export class Option<T> extends Enum<{ Some: unknown; None: void }>() {
  static fromOutput<T>(output: T) {
    return Some(output);
  }

  branch(): ControlFlow<Option<T>, T> {
    return this.match({
      Some: (v) => ControlFlow.Continue(v),
      None: () => ControlFlow.Break(None()),
    });
  }

  /**
   * Creates a `Some` type `Option`
   */
  static Some<T>(value: T): Option<T> {
    return Option.create("Some", value) as Option<T>;
  }

  /**
   * Creates a `None` type `Option`
   */
  static None<T>(): Option<T> {
    return Option.create("None") as Option<T>;
  }

  /**
   * If `value` is `null`, `undefined` or `NaN`
   * it returns a None, otherwise returns a Some
   */
  static fromValue<T>(value: T): Option<Exclude<T, null | undefined>> {
    if (
      value === null ||
      value === undefined ||
      (typeof value === "number" && isNaN(value))
    ) {
      return None();
    }
    return Some(value as Exclude<T, null | undefined>);
  }

  /**
   * It returns true if `Option` is `Some`
   * @example
   * const some = Some(0);
   * expect(some.isSome()).toBe(true);
   *
   * const none = None();
   * expect(none.isSome()).toBe(false);
   */
  isSome(): boolean {
    return this.is("Some");
  }

  /**
   * It returns true if `Option` is `None`
   * @example
   * const some = Some(0);
   * expect(some.isNone()).toBe(false);
   *
   * const none = None();
   * expect(none.isNone()).toBe(true);
   */
  isNone(): boolean {
    return this.is("None");
  }

  isNoneOr(func: (val: T) => boolean): boolean {
    return this.match({
      Some: (value) => func(value),
      None: () => true,
    });
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
    this.ifSome(func);
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
    if (this.isSome()) {
      return this;
    }
    return optb;
  }

  /**
   * Returns `this` if is `Some`, otherwise execute the `func` parameter and return its returned value.
   * @example
   * const none = None<number[]>();
   * const result1 = none.orElse(() => {
   *   return Some([4, 20]);
   * });
   * expect(result1).toEqual(Some([4, 20]));
   *
   * const some = Some(69);
   * const result2 = some.orElse(() => {
   *   return Some(13);
   * });
   * expect(result2).toEqual(Some(69));
   */
  orElse(func: () => Option<T>): Option<T> {
    if (this.isSome()) {
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
    if (this.isSome()) {
      if (optb.isSome()) {
        return None();
      }
      return this;
    }
    if (optb.isSome()) {
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
    if (this.isSome() && optb.isSome()) {
      return optb;
    }
    return None();
  }

  /**
   * If `Option` is `Some`, execute the `f` parameter and return its returned value, otherwise return `None`
   * @example
   * const none = None<number>();
   * const result1 = none.andThen((value) => {
   *   return Some(value * value);
   * });
   * expect(result1).toEqual(None());
   *
   * const some = Some(5);
   * const result = some.andThen((value) => {
   *   return Some(value * value);
   * });
   * expect(result).toEqual(Some(25));
   */
  andThen<U>(f: (value: T) => Option<U>): Option<U> {
    return this.match({
      Some: (x) => f(x),
      None: () => None(),
    });
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
    return this.match({
      Some: (x) => x,
      None: () => panic(msg),
    });
  }

  /**
   * If `Option` is `None` insert the `value` parameter in `Option`, then return the value. If `Option` is `Some` it just return its value.
   * @example
   * const option1 = None<number>();
   * const result1 = option1.getOrInsert(3.1415);
   * expect(result1).toBe(3.1415);
   * expect(option1).toEqual(Some(3.1415));
   *
   * const option2 = Some(42);
   * const result2 = option2.getOrInsert(19);
   * expect(result2).toBe(42);
   * expect(option2).toEqual(Some(42));
   */
  getOrInsert(value: T): T {
    this.ifNone(() => {
      this.changeTo("Some", value);
    });
    return this.unwrap();
  }

  /**
   * If `Option` is `None` execute the `func` parameter and insert its returned value in `Option` then return the inserted value. If `Option` is `Some` it just return its value.
   * @example
   * const option1 = None<string>();
   * const result1 = option1.getOrInsertWith(
   *   () => "Hello World!"
   * );
   * expect(result1).toEqual("Hello World!");
   * expect(option1).toEqual(Some("Hello World!"));
   *
   * const option2 = Some("Cards Against Humanity");
   * const result2 = option2.getOrInsertWith(
   *   () => "Humanity"
   * );
   * expect(result2).toEqual("Cards Against Humanity");
   * expect(option2).toEqual(Some("Cards Against Humanity"));
   */
  getOrInsertWith(func: () => T): T {
    this.ifNone(() => {
      this.changeTo("Some", func());
    });
    return this.unwrap();
  }

  /**
   * Insert the `value` parameter in `Option` and return it.
   * @example
   * const coolSong = "https://open.spotify.com/track/4S3dFI8Sx3UsKOUnoYFCg2";
   *
   * const option1 = None<string>();
   * const result1 = option1.insert(coolSong);
   * expect(result1).toBe(coolSong);
   * expect(option1).not.toEqual(None());
   * expect(option1).toEqual(Some(coolSong));
   *
   * const option2 = Some(1);
   * const result2 = option2.insert(2);
   * expect(result2).toBe(2);
   * expect(option2).not.toEqual(Some(1));
   * expect(option2).toEqual(Some(2));
   */
  insert(value: T): T {
    this.changeTo("Some", value);
    return value;
  }

  /**
   * If `Option` is `None` returns `false`, if it is `Some` execute the `f` parameter and return its returned value.
   * @example
   * const rTrue = () => true;
   * const rFalse = () => false;
   *
   * const none = None();
   * expect(none.isSomeAnd(rTrue)).toBe(false);
   * expect(none.isSomeAnd(rFalse)).toBe(false);
   *
   * const some = Some(1);
   * expect(some.isSomeAnd(rTrue)).toBe(true);
   * expect(some.isSomeAnd(rFalse)).toBe(false);
   * expect(some.isSomeAnd((value) => value == 1)).toBe(true);
   * expect(some.isSomeAnd((value) => value == 2)).toBe(false);
   */
  isSomeAnd(f: (value: T) => boolean): boolean {
    return this.match({
      None: () => false,
      Some: (x) => f(x),
    });
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
    return this.match({
      Some: (x) => {
        this.changeTo("None");
        return Some(x);
      },
      None: () => None(),
    });
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
    return this.match({
      Some: (x) => x,
      None: () => panic("Called `unwrap` method on a `None`"),
    });
  }

  /**
   * If `Option` is `Some` return its value. If `Option` is `None` return the parameter `value`.
   * @example
   * const none = None<string>();
   * const result1 = none.unwrapOr("31 minutos");
   * expect(result1).toBe("31 minutos");
   *
   * const some = Some("Mr. Trance");
   * const result2 = some.unwrapOr("Esteman");
   * expect(result2).toBe("Mr. Trance");
   */
  unwrapOr(value: T): T {
    return this.match({
      Some: (x) => x,
      None: () => value,
    });
  }

  /**
   * If `Option` is `Some` return its value. If `Option` is `None` execute the parameter `func` and return its returned value
   * @example
   * const none = None<number>();
   * const result1 = none.unwrapOrElse(() => 0xe0218a);
   * expect(result1).toBe(0xe0218a);
   *
   * const some = Some(0);
   * const result2 = some.unwrapOrElse(() => 1);
   * expect(result2).toBe(0);
   */
  unwrapOrElse(func: () => T): T {
    return this.match({
      Some: (x) => x,
      None: () => func(),
    });
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
    if (this.isNone() || other.isNone()) {
      return None();
    }
    return Some([this.unwrap(), other.unwrap()]);
  }

  /**
   * If `Option` is `Some` it will call the `f` parameter
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
  map<U>(f: (value: T) => U): Option<U> {
    return this.match({
      Some: (x) => Some(f(x)),
      None: () => None(),
    });
  }

  /**
   * If `Option` is `Some` it will call the `f` parameter
   * and return its returned value,
   * otherwise it will return the `def` parameter
   * @example
   * const none = None();
   * const result1 = none.mapOr("Hola", () => {
   *   return "Hello";
   * });
   * expect(result1).toBe("Hola");
   *
   * const some = Some(356);
   * const result2 = some.mapOr("NotAHexNumber", (value) => {
   *   return value.toString(16);
   * });
   * expect(result2).toBe("164");
   */
  mapOr<U>(def: U, f: (value: T) => U): U {
    return this.match({
      Some: (x) => f(x),
      None: () => def,
    });
  }

  /**
   * If `Option` is `Some` it will call the `f` parameter
   * and return its returned value. If `Option` is `None` it will call
   * the `def` parameter and return its returned value.
   * @example
   * const none = None();
   * const result1 = none.mapOrElse(
   *   () => {
   *   return "It is None";
   *   },
   *   () => {
   *     return "It is Some";
   *   },
   * );
   * expect(result1).toBe("It is None");
   *
   * const some = Some(17);
   * const result2 = some.mapOrElse(
   *   () => {
   *     return "It is None";
   *   },
   *   (value) => {
   *     return value.toString();
   *   },
   * );
   * expect(result2).toBe("17");
   */
  mapOrElse<U>(def: () => U, f: (value: T) => U): U {
    return this.match({
      Some: (x) => f(x),
      None: () => def(),
    });
  }

  /**
   * If `Option` is `Some` it will return its value wrapped on an `Ok`.
   * If `Option` is `None` it will return the `err` parameter wrapped
   * on an `Err`.
   * @example
   * const none = None();
   * const result1 = none.okOr("The value was a None");
   * expect(result1).toEqual(Err("The value was a None"));
   *
   * const some = Some(9);
   * const result2 = some.okOr("The value was a None");
   * expect(result2).toEqual(Ok(9));
   */
  okOr<E>(err: E): Result<T, E> {
    return this.match({
      Some: (x) => Ok(x),
      None: () => Err(err),
    });
  }

  /**
   * If `Option` is `Some` it will return its value wrapped on an `Ok`.
   * If `Option` is `None` it will call the `err` parameter and
   * return its returned value wrapped on an `Err`.
   * @example
   * const none = None();
   * const result1 = none.okOrElse(() => 68);
   * expect(result1).toEqual(Err(68));
   *
   * const some = Some("DCLXVI");
   * const result2 = some.okOrElse(() => "DCXVI");
   * expect(result2).toEqual(Ok("DCLXVI"));
   */
  okOrElse<E>(err: () => E): Result<T, E> {
    return this.match({
      Some: (x) => Ok(x),
      None: () => Err(err()),
    });
  }

  /**
   * This method return the value in `Some` or `undefined` if its `None`, without
   * any previous check. AVOID USING THIS METHOD.
   * @example
   * const none = None();
   * const result1 = none.unwrapUnchecked();
   * expect(result1).toBe(undefined);
   *
   * const some = Some("Some");
   * const result2 = some.unwrapUnchecked();
   * expect(result2).toBe("Some");
   */
  unwrapUnchecked(): T | undefined {
    return this.toJSON().value as T;
  }

  /**
   * Call the `func` parameter just if `Option` is `Some`.
   * @example
   * let value = 0;
   * const none = None();
   * none.ifSome(() => {
   *   value = 1;
   * });
   * expect(value).toBe(0);
   *
   * value = 0;
   * const some = Some(1);
   * some.ifSome((v) => {
   *   value = v;
   * });
   * expect(value).toBe(1);
   */
  ifSome(func: (value: T) => unknown): void {
    this.ifIs("Some", (x) => func(x as T));
  }

  /**
   * Call the `func` parameter just if `Option` is `None`.
   * @example
   * let value = 0;
   * const none = None();
   * none.ifNone(() => {
   *   value = 1;
   * });
   * expect(value).toBe(1);
   *
   * value = 0;
   * const some = Some(1);
   * some.ifNone(() => {
   *   value = 1;
   * });
   * expect(value).toBe(0);
   */
  ifNone(func: () => unknown): void {
    this.ifIs("None", func);
  }

  /**
   * If `Option` is `Some` call the function property `Some`.
   * If `Option` is `None` call the function property `None`.
   *
   * This function will return the returned value by the executed
   * @example
   * let value = 0;
   * const none = None<number>();
   * none.match({
   *   Some: (v) => {
   *     value = v;
   *   },
   *   None: () => {
   *     value = 2;
   *   },
   * });
   * expect(value).toBe(2);
   *
   * value = 0;
   * const some = Some(1);
   * some.match({
   *   Some: (v) => {
   *     value = v;
   *   },
   *   None: () => {
   *     value = 2;
   *   },
   * });
   * expect(value).toBe(1);
   */
  match<R>(arms: { Some: (value: T) => R; None: () => R }): R;
  match<R>(arms: { Some?: (value: T) => R; None?: () => R }, def: () => R): R;
  match<R>(arms: { Some?: (value: T) => R; None?: () => R }, def?: () => R): R {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return super.match(arms as any, def as any);
  }

  changeTo(type: "None"): void;
  changeTo(type: "Some", value: T): void;
  changeTo(type: "Some" | "None", value?: unknown): void {
    super.changeTo(type as "Some", value);
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
