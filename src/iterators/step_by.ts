import { type Option } from "../enums/option.ts";
import { panic } from "../panic.ts";
import type { TryInstance, TryStatic } from "../traits/try_trait.ts";
import { RIterator } from "../traits/iterator.ts";
import { Iter } from "./iter.ts";

function* nth<T>(
  iter: RIterator<T>,
  stepMinusOne: number,
): Generator<T, void, unknown> {
  while (true) {
    const val = iter.nth(stepMinusOne);
    if (val.isNone()) {
      break;
    }
    yield val.unwrap();
  }
}

export class StepBy<T> extends RIterator<T> {
  #iter: RIterator<T>;
  #stepMinusOne: number;
  #firstTake: boolean;

  constructor(iter: RIterator<T>, step: number) {
    super();

    if (step === 0) {
      panic("`step` cannot be zero");
    } else if (Math.round(step) !== step) {
      panic("`step` should be an integer");
    }

    this.#iter = iter;
    this.#stepMinusOne = step - 1;
    this.#firstTake = true;
  }

  protected specNext(): Option<T> {
    let stepSize: number;
    if (this.#firstTake) {
      stepSize = 0;
      this.#firstTake = false;
    } else {
      stepSize = this.#stepMinusOne;
    }

    return this.#iter.nth(stepSize);
  }

  protected specNth(n: number): Option<T> {
    if (this.#firstTake) {
      this.#firstTake = false;
      const first = this.#iter.next();
      if (n === 0) {
        return first;
      }
      n -= 1;
    }

    const step = this.#stepMinusOne + 1;
    const mul = step * n;

    return this.#iter.nth(mul - 1);
  }

  protected specTryFold<Acc, R extends TryInstance<Acc, R>>(
    type: TryStatic<Acc, R>,
    acc: Acc,
    f: (acc: Acc, item: T) => R,
  ): R {
    const iter = this.#iter;

    if (this.#firstTake) {
      this.#firstTake = false;
      const val = iter.next();

      if (val.isNone()) {
        return type.fromOutput(acc) as R;
      }

      const result = f(acc, val.unwrap());
      const flow = result.branch();

      if (flow.isBreak()) {
        return result;
      }

      acc = flow.unwrapContinue();
    }

    return new Iter(nth(iter, this.#stepMinusOne)).tryFold(type, acc, f);
  }

  protected specFold<Acc>(acc: Acc, f: (acc: Acc, item: T) => Acc): Acc {
    const iter = this.#iter;

    if (this.#firstTake) {
      this.#firstTake = false;
      const val = iter.next();

      if (val.isNone()) {
        return acc;
      }

      acc = f(acc, val.unwrap());
    }

    return new Iter(nth(iter, this.#stepMinusOne)).fold(acc, f);
  }

  next(): Option<T> {
    return this.specNext();
  }

  nth(n: number): Option<T> {
    return this.specNth(n);
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  tryFold<B, R extends TryInstance<B, R>>(
    type: TryStatic<B, R>,
    init: B,
    f: (acum: B, item: T) => R,
  ) {
    return this.specTryFold(type, init, f);
  }

  fold<B>(init: B, f: (acum: B, item: T) => B): B {
    return this.specFold(init, f);
  }
}
