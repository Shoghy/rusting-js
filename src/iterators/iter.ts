import { None, type Option, Some } from "../enums/option.ts";
import { RIterator } from "../traits/iterator.ts";

function* sliceGenerator<T>(arr: ArrayLike<T>): Generator<T, void, unknown> {
  for (let i = 0; i < arr.length; ++i) {
    yield arr[i];
  }
}

function* iterableGenerator<T>(
  jsIter: Iterable<T>,
): Generator<T, void, unknown> {
  for (const value of jsIter) {
    yield value;
  }
}

export class Iter<T> extends RIterator<T> {
  #iterator: Iterator<T>;
  #hasEnded = false;

  constructor(iterator: Iterator<T>) {
    super();
    this.#iterator = iterator;
  }

  static fromSlice<ST>(arr: ArrayLike<ST>): Iter<ST> {
    return new Iter(sliceGenerator(arr));
  }

  static fromIterable<ST>(jsIter: Iterable<ST>): Iter<ST> {
    return new Iter(iterableGenerator(jsIter));
  }

  next(): Option<T> {
    if (this.#hasEnded) {
      return None();
    }

    const val = this.#iterator.next();
    if (val.done ?? false) {
      this.#hasEnded = true;
      return None();
    }

    return Some(val.value);
  }
}
