import { None, Option, Some } from "../enums/option";
import { RIterator } from "../traits/iterator";

const a_symbol = Symbol("a");
const b_symbol = Symbol("b");

export class Zip<A, B> extends RIterator<[A, B]> {
  [a_symbol]: RIterator<A>;
  [b_symbol]: RIterator<B>;

  constructor(a: RIterator<A>, b: RIterator<B>) {
    super();

    this[a_symbol] = a;
    this[b_symbol] = b;
  }

  next(): Option<[A, B]> {
    return this[a_symbol]
      .next()
      .and_then((aValue) =>
        this[b_symbol].next().and_then((bValue) => Some([aValue, bValue])),
      );
  }

  protected super_nth(n: number): Option<[A, B]> {
    let value = this.next();
    while (value.is_some()) {
      if (n === 0) {
        return value;
      }
      n -= 1;
      value = this.next();
    }
    return None();
  }

  protected spec_fold<Acc>(init: Acc, f: (acc: Acc, item: [A, B]) => Acc): Acc {
    let acum = init;

    while (true) {
      const val = this.next();
      if (val.is_none()) {
        break;
      }
      acum = f(acum, val.unwrap());
    }

    return acum;
  }

  fold<Acc>(init: Acc, f: (acc: Acc, item: [A, B]) => Acc): Acc {
    return this.spec_fold(init, f);
  }

  nth(n: number): Option<[A, B]> {
    return this.super_nth(n);
  }
}
