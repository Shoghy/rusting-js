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
    if (this.#a.is_some()) {
      const val = this.#a.unwrap().next();
      if (val.is_some()) {
        return val;
      }
      this.#a = None();
    }

    if (this.#b.is_some()) {
      const val = this.#b.unwrap().next();
      if (val.is_some()) {
        return val;
      }
      this.#b = None();
    }

    return None();
  }

  count(): number {
    const a_count = this.#a.match({
      Some: (a) => a.count(),
      None: () => 0,
    });

    const b_count = this.#b.match({
      Some: (b) => b.count(),
      None: () => 0,
    });

    return a_count + b_count;
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  try_fold<B, R extends TryInstance<B, unknown>>(
    type: { from_output(output: B): R },
    init: B,
    f: (acum: B, item: T) => R,
  ): R {
    let acc = init;
    try {
      this.#a.if_some((a) => {
        const result = a.try_fold(type, acc, f);
        const flow = result.branch();
        if (flow.is_break()) {
          throw result;
        }
        acc = flow.unwrap_continue();
        this.#a = None();
      });

      this.#b.if_some((b) => {
        const result = b.try_fold(type, acc, f);
        const flow = result.branch();
        if (flow.is_break()) {
          throw result;
        }
        acc = flow.unwrap_continue();
      });
    } catch (e) {
      return e as R;
    }

    return type.from_output(acc);
  }

  fold<B>(init: B, f: (acum: B, item: T) => B): B {
    let acc = init;
    this.#a.if_some((a) => {
      acc = a.fold(acc, f);
    });

    this.#b.if_some((b) => {
      acc = b.fold(acc, f);
    });

    return acc;
  }

  advance_by(n: number): Result<void, number> {
    if (this.#a.is_some()) {
      const a = this.#a.unwrap();
      const result = a.advance_by(n);

      if (result.is_ok()) {
        return result;
      }

      n = result.unwrap_err();
      this.#a = None();
    }

    if (this.#b.is_none()) {
      return Err(n);
    }

    return this.#b.unwrap().advance_by(n);
  }

  nth(n: number): Option<T> {
    if (this.#a.is_some()) {
      const a = this.#a.unwrap();
      const result = a.advance_by(n);

      if (result.is_ok()) {
        const val = a.next();
        if (val.is_some()) {
          return val;
        }

        n = 0;
      } else {
        n = result.unwrap_err();
      }
    }

    if (this.#b.is_none()) {
      return None();
    }

    return this.#b.unwrap().nth(n);
  }
}
