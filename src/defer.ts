import { Err, Ok, type Result } from "./enums/result.ts";

import { promiseWithResolvers } from "./utils.ts";

export function defer<T>(
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
