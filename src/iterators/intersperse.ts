import { None, type Option, Some } from "../enums/option.ts";
import { RIterator } from "../traits/iterator.ts";

function intersperseFold<T, I extends RIterator<T>, B>(
  iter: I,
  init: B,
  f: (accum: B, value: T) => B,
  separator: () => T,
  started: boolean,
  nextItem: Option<T>,
) {
  let accum = init;

  let first: Option<T>;
  if (started) {
    first = nextItem.take();
  } else {
    first = iter.next();
  }

  first.ifSome((x) => {
    accum = f(accum, x);
  });

  return iter.fold(accum, (acc, x) => {
    acc = f(acc, separator());
    acc = f(acc, x);
    return acc;
  });
}

export class Intersperse<T> extends RIterator<T> {
  #started: boolean = false;
  #iter: RIterator<T>;
  #nextItem = None<T>();
  #separator: T;

  constructor(iter: RIterator<T>, separator: T) {
    super();
    this.#iter = iter;
    this.#separator = separator;
  }

  next(): Option<T> {
    if (!this.#started) {
      this.#started = true;
      return this.#iter.next();
    }

    const value = this.#nextItem.take();
    if (value.isSome()) {
      return value;
    }

    const nextItem = this.#iter.next();
    if (nextItem.isNone()) {
      return nextItem;
    }

    this.#nextItem = nextItem;
    return Some(this.#separator);
  }

  fold<B>(init: B, f: (accum: B, value: T) => B) {
    return intersperseFold(
      this.#iter,
      init,
      f,
      () => this.#separator,
      this.#started,
      this.#nextItem,
    );
  }
}
