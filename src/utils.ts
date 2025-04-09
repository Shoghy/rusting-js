import type { Result } from "./enums/result";
import { catch_unwind, catch_unwind_async, panic } from "./panic";

export function StaticImplements<T>() {
  return <U extends T>(constructor: U) => {
    constructor;
  };
}

export function CopyTo(dest: object, src: object): void {
  Object.setPrototypeOf(dest, Object.getPrototypeOf(src));
  Object.defineProperties(dest, Object.getOwnPropertyDescriptors(src));
}

export interface DeferObject {
  [Symbol.dispose](): void;
  [Symbol.asyncDispose](): Promise<void>;
}

/**
 * The `func` parameter is executed when the
 * function that called `defer` returns
 * or throw an error.
 *
 * To use it you just need to create a dummy
 * variable with the `using` keyword.
 * ```ts
 * function example() {
 *   using _d1 = defer(() => {
 *     console.log("AEUGH");
 *   });
 *
 *   console.log("Hello young lady");
 * }
 *
 * example();
 * //Hello young lady
 * //AEUGH
 */
export function defer(func: () => unknown): DeferObject {
  return {
    [Symbol.dispose]() {
      func();
    },

    async [Symbol.asyncDispose]() {
      await func();
    },
  };
}

export enum PromiseState {
  AWAITING,
  RESOLVED,
  REJECTED,
}

export class ManualPromise<T, E = Error> {
  resolve!: (value: T | PromiseLike<T>) => void;
  reject!: (value: E) => void;
  get state() {
    return this._state;
  }

  private _state: PromiseState;
  private promise: Promise<T>;

  constructor() {
    let resolve: (value: T | PromiseLike<T>) => void;
    let reject: (value: E) => void;
    this._state = PromiseState.AWAITING;

    this.promise = new Promise((rsv, rjc) => {
      resolve = (value) => {
        rsv(value);
        this._state = PromiseState.RESOLVED;
        resolve = () =>
          panic("Calling `resolve` on an already resolved `ManualPromise`");
        reject = () =>
          panic("Calling `reject` on an already resolved `ManualPromise`");
      };

      reject = (value) => {
        rjc(value);
        this._state = PromiseState.REJECTED;
        resolve = () =>
          panic("Calling `resolve` on an already rejected `ManualPromise`");
        reject = () =>
          panic("Calling `reject` on an already rejected `ManualPromise`");
      };
    });

    this.resolve = (value) => resolve!(value);
    this.reject = (value) => reject!(value);
  }

  try_resolve(value: T | PromiseLike<T>): Result<void, Error> {
    return catch_unwind(() => this.resolve(value));
  }

  try_reject(value: E): Result<void, Error> {
    return catch_unwind(() => this.reject(value));
  }

  wait() {
    return catch_unwind_async<Promise<T>, E>(() => this.promise);
  }
}
