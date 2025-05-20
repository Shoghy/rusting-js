import { None, type Option, Some } from "../enums/option.ts";
import { RIterator } from "../traits/iterator.ts";

function* sliceGenerator<T>(arr: ArrayLike<T>) {
  for (let i = 0; i < arr.length; ++i) {
    yield arr[i];
  }
}

function* iterableGenerator<T>(jsIter: Iterable<T>) {
  for (const value of jsIter) {
    yield value;
  }
}

export class Iter<T> extends RIterator<T> {
  #generator: Iterator<T>;
  #hasEnded = false;

  constructor(generator: Iterator<T>) {
    super();
    this.#generator = generator;
  }

  static fromSlice<T>(arr: ArrayLike<T>) {
    return new Iter(sliceGenerator(arr));
  }

  static fromIterable<T>(jsIter: Iterable<T>) {
    return new Iter(iterableGenerator(jsIter));
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
