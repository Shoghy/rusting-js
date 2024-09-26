import { None, type Option, Some } from "../enums/option.ts";
import { RIterator } from "../traits/iterator.ts";

const generator_symbol = Symbol("generator");
const has_ended_symbol = Symbol("has_ended");

export class Iter<T> extends RIterator<T> {
  private [generator_symbol]: Generator<T>;
  private [has_ended_symbol] = false;

  constructor(generator: Generator<T>) {
    super();
    this[generator_symbol] = generator;
  }

  static from_slice<T>(arr: ArrayLike<T>): Iter<T> {
    const arr_clone: T[] = [];
    for (let i = 0; i < arr.length; ++i) {
      arr_clone[i] = arr[i];
    }

    function* gen() {
      for (let i = 0; i < arr_clone.length; ++i) {
        yield arr_clone[i];
      }
    }

    return new Iter(gen());
  }

  next(): Option<T> {
    if (this[has_ended_symbol]) {
      return None();
    }

    const val = this[generator_symbol].next();
    if (val.done) {
      this[has_ended_symbol] = true;
      return None();
    }

    return Some(val.value);
  }
}
