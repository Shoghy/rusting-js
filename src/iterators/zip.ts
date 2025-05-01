import { None, Option, Some } from "../enums/option";
import { RIterator } from "../traits/iterator";

export class Zip<A, B> extends RIterator<[A, B]> {
  #a: RIterator<A>;
  #b: RIterator<B>;

  constructor(a: RIterator<A>, b: RIterator<B>) {
    super();

    this.#a = a;
    this.#b = b;
  }

  next(): Option<[A, B]> {
    return this.#a
      .next()
      .andThen((aValue) =>
        this.#b.next().andThen((bValue) => Some([aValue, bValue])),
      );
  }

  protected superNth(n: number): Option<[A, B]> {
    let value = this.next();
    while (value.isSome()) {
      if (n === 0) {
        return value;
      }
      n -= 1;
      value = this.next();
    }
    return None();
  }

  protected specFold<Acc>(init: Acc, f: (acc: Acc, item: [A, B]) => Acc): Acc {
    let acum = init;

    while (true) {
      const val = this.next();
      if (val.isNone()) {
        break;
      }
      acum = f(acum, val.unwrap());
    }

    return acum;
  }

  fold<Acc>(init: Acc, f: (acc: Acc, item: [A, B]) => Acc): Acc {
    return this.specFold(init, f);
  }

  nth(n: number): Option<[A, B]> {
    return this.superNth(n);
  }
}
