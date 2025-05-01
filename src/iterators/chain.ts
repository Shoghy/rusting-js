import { RIterator } from "../traits/iterator.ts";
import { None, Option, Some } from "../enums/option.ts";
import type { TryInstance } from "../traits/try_trait.ts";
import { Err, Result } from "../enums/result.ts";

export class Chain<T> extends RIterator<T> {
  #a: Option<RIterator<T>>;
  #b: Option<RIterator<T>>;

  constructor(a: RIterator<T>, b: RIterator<T>) {
    super();
    this.#a = Some(a);
    this.#b = Some(b);
  }

  next(): Option<T> {
    if (this.#a.isSome()) {
      const val = this.#a.unwrap().next();
      if (val.isSome()) {
        return val;
      }
      this.#a = None();
    }

    if (this.#b.isSome()) {
      const val = this.#b.unwrap().next();
      if (val.isSome()) {
        return val;
      }
      this.#b = None();
    }

    return None();
  }

  count(): number {
    const aCount = this.#a.match({
      Some: (a) => a.count(),
      None: () => 0,
    });

    const bCount = this.#b.match({
      Some: (b) => b.count(),
      None: () => 0,
    });

    return aCount + bCount;
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  tryFold<B, R extends TryInstance<B, unknown>>(
    type: { fromOutput(output: B): R },
    init: B,
    f: (acum: B, item: T) => R,
  ): R {
    let acc = init;
    try {
      this.#a.ifSome((a) => {
        const result = a.tryFold(type, acc, f);
        const flow = result.branch();
        if (flow.isBreak()) {
          throw result;
        }
        acc = flow.unwrapContinue();
        this.#a = None();
      });

      this.#b.ifSome((b) => {
        const result = b.tryFold(type, acc, f);
        const flow = result.branch();
        if (flow.isBreak()) {
          throw result;
        }
        acc = flow.unwrapContinue();
      });
    } catch (e) {
      return e as R;
    }

    return type.fromOutput(acc);
  }

  fold<B>(init: B, f: (acum: B, item: T) => B): B {
    let acc = init;
    this.#a.ifSome((a) => {
      acc = a.fold(acc, f);
    });

    this.#b.ifSome((b) => {
      acc = b.fold(acc, f);
    });

    return acc;
  }

  advanceBy(n: number): Result<void, number> {
    if (this.#a.isSome()) {
      const a = this.#a.unwrap();
      const result = a.advanceBy(n);

      if (result.isOk()) {
        return result;
      }

      n = result.unwrapErr();
      this.#a = None();
    }

    if (this.#b.isNone()) {
      return Err(n);
    }

    return this.#b.unwrap().advanceBy(n);
  }

  nth(n: number): Option<T> {
    if (this.#a.isSome()) {
      const a = this.#a.unwrap();
      const result = a.advanceBy(n);

      if (result.isOk()) {
        const val = a.next();
        if (val.isSome()) {
          return val;
        }

        n = 0;
      } else {
        n = result.unwrapErr();
      }
    }

    if (this.#b.isNone()) {
      return None();
    }

    return this.#b.unwrap().nth(n);
  }
}
