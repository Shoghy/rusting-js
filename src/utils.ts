import { catchUnwindAsync } from "./panic.ts";

export function StaticImplements<T>() {
  return <U extends T>(_: U) => {};
}

export function copyTo(dest: object, src: object): void {
  Object.setPrototypeOf(dest, Object.getPrototypeOf(src));
  Object.defineProperties(dest, Object.getOwnPropertyDescriptors(src));
}

export interface PromiseWithResolvers<T, E> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (value?: E) => void;
}

export function promiseWithResolvers<T, E = Error>(): PromiseWithResolvers<
  T,
  E
> {
  let resolve!: (value: T) => void;
  let reject!: (value?: E) => void;

  const promise = new Promise<T>((rsv, rjc) => {
    resolve = rsv;
    reject = rjc;
  });

  return { promise, resolve, reject };
}

export function safeFetch(...params: Parameters<typeof fetch>) {
  return catchUnwindAsync(() => fetch(...params));
}
