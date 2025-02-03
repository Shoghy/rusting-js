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
    function* gen() {
      for (let i = 0; i < arr.length; ++i) {
        yield arr[i];
      }
    }

    return new Iter(gen());
  }

  static from_iterable<T>(jsIter: Iterable<T>) {
    function* gen() {
      for (const value of jsIter) {
        yield value;
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
