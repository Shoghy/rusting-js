import { None, type Option, Some } from "../enums/option.ts";
import { RIterator } from "../traits/iterator.ts";

export class Iter<T> extends RIterator<T> {
  #generator: Generator<T>;
  #has_ended = false;

  constructor(generator: Generator<T>) {
    super();
    this.#generator = generator;
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
    if (this.#has_ended) {
      return None();
    }

    const val = this.#generator.next();
    if (val.done) {
      this.#has_ended = true;
      return None();
    }

    return Some(val.value);
  }
}
