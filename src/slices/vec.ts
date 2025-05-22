import { panic } from "../panic.ts";

export enum Ordering {
  Greater = 1,
  Equal = 0,
  Less = -1,
}

const ArrSymbol = Symbol("Arr");
const IntRegex = /^[0-9]+$/;

function getVecIndex<T>(vec: VecClass<T>, index: number) {
  if (vec[ArrSymbol].length <= index) {
    panic("Accessing `index` out of the array");
  }

  return vec[ArrSymbol][index];
}

const VecProxyHandler: ProxyHandler<VecClass<unknown>> = {
  get(target, p, receiver) {
    if (typeof p === "symbol") {
      return Reflect.get(target, p, receiver);
    }

    if (IntRegex.test(p)) {
      return getVecIndex(target, parseInt(p, 10));
    }

    return Reflect.get(target, p, receiver);
  },
};

class VecClass<T> {
  [ArrSymbol]: Array<T>;

  [key: number]: T;

  constructor(...values: T[]) {
    this[ArrSymbol] = values;
  }

  sort(f: (a: T, b: T) => Ordering) {
    this[ArrSymbol].sort(f);
  }

  get(index: number): T {
    return this[ArrSymbol][index];
  }
}

export const Vec = new Proxy(VecClass, {
  construct(target, argArray, newTarget) {
    const instance = Reflect.construct(target, argArray, newTarget);
    return new Proxy(instance, VecProxyHandler);
  },
});
