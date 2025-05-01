import { None, type Option, Some } from "../enums/option.ts";
import { RIterator } from "../traits/iterator.ts";

export class Iter<T> extends RIterator<T> {
  #generator: Generator<T>;
  #hasEnded = false;

  constructor(generator: Generator<T>) {
    super();
    this.#generator = generator;
  }

  static fromSlice<T>(arr: ArrayLike<T>): Iter<T> {
    function* gen() {
      for (let i = 0; i < arr.length; ++i) {
        yield arr[i];
      }
    }

    return new Iter(gen());
  }

  static fromIterable<T>(jsIter: Iterable<T>) {
    function* gen() {
      for (const value of jsIter) {
        yield value;
      }
    }

    return new Iter(gen());
  }

  next(): Option<T> {
    if (this.#hasEnded) {
      return None();
    }

    const val = this.#generator.next();
    if (val.done) {
      this.#hasEnded = true;
      return None();
    }

    return Some(val.value);
  }
}
