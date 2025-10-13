import type { Result } from "./enums/result";
import { catchUnwindAsync } from "./panic.ts";
import { promiseWithResolvers } from "./utils.ts";

export async function defer<T>(
  promise: Promise<T>,
  func: (value: Result<Awaited<T>, Error>) => unknown,
) {
  func(await catchUnwindAsync(() => promise));
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
