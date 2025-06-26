import { None, Some, type Option } from "../enums/option.ts";
import { Iter } from "../iterators/iter.ts";
import { panic } from "../panic.ts";

export enum Ordering {
  Greater = 1,
  Equal = 0,
  Less = -1,
}

const ArrSymbol = Symbol("Arr");
const UIntRegex = /^[0-9]+$/;
const StrRangeRegex = /^[0-9]*\.\.(=[0-9]+|[0-9]*)$/;

type StrRange =
  | ".."
  | `${number}..`
  | `..${number}`
  | `${number}..${number}`
  | `..=${number}`
  | `${number}..=${number}`;

function getVecIndex<T>(vec: VecClass<T>, index: number) {
  if (vec[ArrSymbol].length <= index) {
    panic("Accessing `index` out of the array");
  }

  return vec[ArrSymbol][index];
}

function* createIterator<T>(vec: VecClass<T>, start: number, end: number) {
  for (let i = start; i < end; ++i) {
    yield vec[ArrSymbol][i];
  }
}

function getVecRange<T>(vec: VecClass<T>, range: StrRange): Iter<T> {
  const length = vec[ArrSymbol].length;
  if (range === "..") {
    return new Iter(createIterator(vec, 0, length));
  }

  let start = 0;
  let end = 0;

  let splitStr = "..";
  if (range.includes("=")) {
    splitStr += "=";
    end = 1;
  }

  const [a, b] = range.split(splitStr);
  if (b !== "") {
    end += parseInt(b, 10);
  } else {
    end = length;
  }
  if (a !== "") {
    start = parseInt(a, 10);
  }

  if (start >= length || end > length) {
    panic("Out of range");
  }
  if (start > end) {
    panic("Range is reversed");
  }

  return new Iter(createIterator(vec, start, end));
}

const VecProxyHandler: ProxyHandler<VecClass<unknown>> = {
  get(target, p, receiver) {
    if (typeof p === "symbol") {
      return Reflect.get(target, p, receiver);
    }

    if (UIntRegex.test(p)) {
      return getVecIndex(target, parseInt(p, 10));
    }

    if (StrRangeRegex.test(p)) {
      return getVecRange(target, p as StrRange);
    }

    return Reflect.get(target, p, receiver);
  },

  set(target, p, newValue, receiver) {
    if (typeof p === "symbol") {
      return Reflect.set(target, p, newValue, receiver);
    }

    if (UIntRegex.test(p)) {
      const index = parseInt(p, 10);
      if (target[ArrSymbol].length >= index) {
        panic("Accessing `index` out of the array");
      }
      target[ArrSymbol][index] = newValue;
      return true;
    }

    return Reflect.set(target, p, newValue, receiver);
  },
};

type VecRangeKeys<T> = {
  [key in StrRange]: Iter<T>;
};

class VecClass<T> {
  [ArrSymbol]: Array<T>;

  [key: number]: T;

  *[Symbol.iterator]() {
    for (let i = 0; i < this[ArrSymbol].length; ++i) {
      yield this[ArrSymbol][i];
    }
  }

  constructor(...values: T[]) {
    this[ArrSymbol] = values;
  }

  get length() {
    return this[ArrSymbol].length;
  }

  sort(f: (a: T, b: T) => Ordering) {
    this[ArrSymbol].sort(f);
  }

  get(index: number): Option<T> {
    if (index >= this[ArrSymbol].length) {
      None();
    }
    return Some(this[ArrSymbol][index]);
  }

  iter() {
    return new Iter(createIterator(this, 0, this[ArrSymbol].length));
  }

  push(value: T) {
    this[ArrSymbol].push(value);
  }
}

export const Vec = new Proxy(VecClass, {
  construct(target, argArray, newTarget) {
    const instance = Reflect.construct(target, argArray, newTarget);
    return new Proxy(instance, VecProxyHandler);
  },
}) as new <T>(...values: T[]) => VecClass<T> & VecRangeKeys<T>;
