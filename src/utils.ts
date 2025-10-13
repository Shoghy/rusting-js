export function StaticImplements<T>() {
  return <U extends T>(_: U) => {};
}

export function copyTo(dest: object, src: object): void {
  Object.setPrototypeOf(dest, Object.getPrototypeOf(src));
  Object.defineProperties(dest, Object.getOwnPropertyDescriptors(src));
}

export interface DeferObject {
  [Symbol.dispose](): void;
  [Symbol.asyncDispose](): Promise<void>;
}

export interface PromiseWithResolvers<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (value?: unknown) => void;
}

export function promiseWithResolvers<T>(): PromiseWithResolvers<T> {
  let resolve!: (value: T) => void;
  let reject!: (value?: unknown) => void;

  const promise = new Promise<T>((rsv, rjc) => {
    resolve = rsv;
    reject = rjc;
  });

  return { promise, resolve, reject };
}

export enum PromiseState {
  AWAITING,
  RESOLVED,
  REJECTED,
}
