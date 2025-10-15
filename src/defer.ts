import { Err, Ok, type Result } from "./enums/result.ts";

import { promiseWithResolvers } from "./utils.ts";

export function capturePromise<T>(
  promise: Promise<T>,
  func: (value: Result<T, Error>) => unknown,
) {
  promise
    .then((value) => {
      func(Ok(value));
    })
    .catch((error) => {
      func(Err(error as Error));
    });
}

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
