import { type Option } from "../enums/option";
import { RIterator } from "../traits/iterator";
import { type TryInstance, type TryStatic } from "../traits/try_trait";

function mapFold<T, B, Acc>(f: (arg1: T) => B, g: (arg1: Acc, arg2: B) => Acc) {
  return (acc: Acc, elt: T) => g(acc, f(elt));
}

function mapTryFold<T, B, Acc, R>(
  f: (arg1: T) => B,
  g: (arg1: Acc, arg2: B) => R,
) {
  return (acc: Acc, elt: T) => g(acc, f(elt));
}

export class Map<Orig, Mapped> extends RIterator<Mapped> {
  #iter: RIterator<Orig>;
  #func: (arg: Orig) => Mapped;

  constructor(iter: RIterator<Orig>, func: (arg: Orig) => Mapped) {
    super();
    this.#iter = iter;
    this.#func = func;
  }

  next(): Option<Mapped> {
    return this.#iter.next().map(this.#func);
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  tryFold<Acc, R extends TryInstance<Acc, R>>(
    type: TryStatic<Acc, R>,
    init: Acc,
    g: (accum: Acc, item: Mapped) => R,
  ): R {
    return this.#iter.tryFold(type, init, mapTryFold(this.#func, g));
  }

  fold<Acc>(init: Acc, g: (accum: Acc, item: Mapped) => Acc) {
    return this.#iter.fold(init, mapFold(this.#func, g));
  }
}
