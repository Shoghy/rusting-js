import { type Result } from "./enums/result.ts";
import { catchUnwindAsync } from "./panic.ts";

import { promiseWithResolvers } from "./utils.ts";

export function capturePromise<T, E = Error>(
  promise: PromiseLike<T>,
  func: (value: Result<T, E>) => unknown,
) {
  (async () => {
    func(await catchUnwindAsync<T, E>(() => promise));
  })();
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

export function deferrableGenerator<
  ArgsType extends Array<unknown>,
  T = unknown,
  TReturn = unknown,
  TNext = unknown,
>(
  func: (
    promise: Promise<TReturn>,
    ...args: ArgsType
  ) => Generator<T, TReturn, TNext>,
) {
  return function* (...args: ArgsType) {
    const promise = promiseWithResolvers<TReturn>();

    try {
      const value = func(promise.promise, ...args);
      while (true) {
        const item = value.next();
        if (item.done ?? false) {
          promise.resolve(item.value as TReturn);
          return item.value;
        }
        yield item.value;
      }
    } catch (e) {
      promise.reject(e);
      throw e;
    }
  };
}

export function deferrableAsyncGenerator<
  ArgsType extends Array<unknown>,
  T = unknown,
  TReturn = unknown,
  TNext = unknown,
>(
  func: (
    promise: Promise<TReturn>,
    ...args: ArgsType
  ) => AsyncGenerator<T, TReturn, TNext>,
) {
  return async function* (...args: ArgsType) {
    const promise = promiseWithResolvers<TReturn>();

    try {
      const value = func(promise.promise, ...args);
      while (true) {
        const item = await value.next();
        if (item.done ?? false) {
          promise.resolve(item.value as TReturn);
          return item.value;
        }

        yield item.value;
      }
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
