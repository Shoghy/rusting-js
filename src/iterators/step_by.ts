import { type Option } from "../enums/option.ts";
import { panic } from "../panic.ts";
import type { TryInstance } from "../traits/try_trait.ts";
import { RIterator } from "../traits/iterator.ts";
import { Iter } from "./iter.ts";

const iter_symbol = Symbol("iter");
const step_minus_one_symbol = Symbol("step_minus_one");
const first_take_symbol = Symbol("first_take");

function* nth<T>(
  iter: RIterator<T>,
  step_minus_one: number,
): Generator<T, void, unknown> {
  while (true) {
    const val = iter.nth(step_minus_one);
    if (val.is_none()) {
      break;
    }
    yield val.unwrap();
  }
}

export class StepBy<T> extends RIterator<T> {
  private [iter_symbol]: RIterator<T>;
  private [step_minus_one_symbol]: number;
  private [first_take_symbol]: boolean;

  constructor(iter: RIterator<T>, step: number) {
    super();

    if (step === 0) {
      panic("`step` cannot be zero");
    } else if (Math.round(step) !== step) {
      panic("`step` should be an integer");
    }

    this[iter_symbol] = iter;
    this[step_minus_one_symbol] = step - 1;
    this[first_take_symbol] = true;
  }

  protected spec_next(): Option<T> {
    let step_size: number;
    if (this[first_take_symbol]) {
      step_size = 0;
      this[first_take_symbol] = false;
    } else {
      step_size = this[step_minus_one_symbol];
    }

    return this[iter_symbol].nth(step_size);
  }

  protected spec_nth(n: number): Option<T> {
    if (this[first_take_symbol]) {
      this[first_take_symbol] = false;
      const first = this[iter_symbol].next();
      if (n === 0) {
        return first;
      }
      n -= 1;
    }

    const step = this[step_minus_one_symbol] + 1;
    const mul = step * n;

    return this[iter_symbol].nth(mul - 1);
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  protected spec_try_fold<Acc, R extends TryInstance<Acc, unknown>>(
    type: { from_output(output: Acc): R },
    acc: Acc,
    f: (acc: Acc, item: T) => R,
  ): R {
    const iter = this[iter_symbol];

    if (this[first_take_symbol]) {
      this[first_take_symbol] = false;
      const val = iter.next();

      if (val.is_none()) {
        return type.from_output(acc);
      }

      const result = f(acc, val.unwrap());
      const flow = result.branch();

      if (flow.is_break()) {
        return result;
      }

      acc = flow.unwrap_continue();
    }

    return new Iter(nth(iter, this[step_minus_one_symbol])).try_fold(
      type,
      acc,
      f,
    );
  }

  protected spec_fold<Acc>(acc: Acc, f: (acc: Acc, item: T) => Acc): Acc {
    const iter = this[iter_symbol];

    if (this[first_take_symbol]) {
      this[first_take_symbol] = false;
      const val = iter.next();

      if (val.is_none()) {
        return acc;
      }

      acc = f(acc, val.unwrap());
    }

    return new Iter(nth(iter, this[step_minus_one_symbol])).fold(acc, f);
  }

  next(): Option<T> {
    return this.spec_next();
  }

  nth(n: number): Option<T> {
    return this.spec_nth(n);
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  try_fold<B, R extends TryInstance<B, unknown>>(
    type: { from_output(output: B): R },
    init: B,
    f: (acum: B, item: T) => R,
  ): R {
    return this.spec_try_fold(type, init, f);
  }

  fold<B>(init: B, f: (acum: B, item: T) => B): B {
    return this.spec_fold(init, f);
  }
}
