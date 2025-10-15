import { Err, Ok, type Result } from "./enums/result.ts";

import { promiseWithResolvers } from "./utils.ts";

export function capturePromise<T, E = Error>(
  promise: Promise<T>,
  func: (value: Result<T, E>) => unknown,
) {
  promise
    .then((value) => {
      func(Ok(value));
    })
    .catch((error) => {
      func(Err(error as E));
    });
}

/**
 * @example
 * const func = deferrableFunc((promise, value: string) => {
 *   capturePromise(p, () => {
 *     console.log(value);
 *   });
 *   console.log("Hello");
 * });
 *
 * func("World"); // Hello\nWorld
 */
export function deferrableFunc<ArgsType extends Array<unknown>, ReturnType>(
  func: (promise: Promise<ReturnType>, ...args: ArgsType) => ReturnType,
) {
  return function (...args: ArgsType): ReturnType {
    const promise = promiseWithResolvers<ReturnType>();

    try {
      const value = func(promise.promise, ...args);
      promise.resolve(value);
      return value;
    } catch (e) {
      promise.reject(e);
      throw e;
    }
  };
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
 * @example
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
