import { None, Option, Some } from "../enums/option";
import { Err, Ok, Result } from "../enums/result";
import { panic, unimplemented } from "../panic";
import type { TryInstance } from "./try_trait";
import { ControlFlow } from "../enums/control_flow";

export class RIterator<T> {
  [Symbol.iterator]!: () => Generator<T, void>;

  constructor(){
    this[Symbol.iterator] = function* () {
      while(true){
        const val = this.next();
        if(val.is_none()){
          return;
        }
        yield val.unwrap();
      }
    };
  }

  advance_by(n: number): Result<void, number> {
    for (let i = 0; i < n; ++i) {
      if (this.next().is_none()) {
        return Err(n - i);
      }
    }
    return Ok(undefined as void);
  }

  next(): Option<T> {
    panic("This method should be override by any class that extends RIterator");
  }

  count(): number {
    return this.fold(0, (count) => count + 1);
  }

  last(): Option<T> {
    return this.fold(None<T>(), (_, x) => Some(x));
  }

  nth(n: number): Option<T> {
    if (this.advance_by(n).is_err()) {
      return None();
    }
    return this.next();
  }

  step_by(step: number): never {
    unimplemented(`The return type for this method should be a iterator that go through the elements ${step} by ${step}`);
  }

  chain(other: RIterator<T>): never {
    unimplemented(`The return type for this method should join ${this} and ${other}. When the elements on ${this} end, it should consume the elements in ${other}`);
  }

  zip<U>(other: RIterator<U>): never {
    unimplemented(`The return type by this method should, each time next is called, return an array of typeof [T, U] where T is an element in ${this} and U is an element in ${other}`);
  }

  intersperse(separator: T): never {
    unimplemented(`The return type of this method should "add" ${separator} between each element in ${this}`);
  }

  map<B>(f: (value: T) => B): never {
    unimplemented(`The return type of this method should run the function ${f} for each element and return its returned value.`);
  }

  for_each(f: (value: T) => unknown): void {
    this.fold(undefined as void, (_, item) => f(item));
  }

  filter(predicate: (value: T) => boolean): never {
    unimplemented(`The return type of this method should return only the values that return true after checking them with ${predicate} omiting the others`);
  }

  filter_map<B>(f: (value: T) => Option<B>): never {
    unimplemented(`The return type of this method should return only the values that return Some after checking them with ${f} omiting the others`);
  }

  enumerate(): never {
    unimplemented("The return type of this method should return an Array with 2 items, the first one being the index of the element and the second one being the element");
  }

  peekable(): never {
    unimplemented("The return type of this method should let you \"peek\" which means it will return the next element of the iterator without consuming it.");
  }

  skip_while(predicate: () => boolean): never {
    unimplemented(`Implement this method. ${predicate}`);
  }

  take_while(predicate: () => boolean): never {
    unimplemented(`Implement this method. ${predicate}`);
  }

  map_while(predicate: () => boolean): never {
    unimplemented(`Implement this method. ${predicate}`);
  }

  skip(n: number): never {
    unimplemented(`Implement this method. ${n}`);
  }

  take(n: number): never {
    unimplemented(`Implement this method. ${n}`);
  }

  scan<ST, B>(initial_state: ST, f: (st: ST, item: T) => Option<B>): never {
    unimplemented(`Implement this method. ${initial_state} ${f}`);
  }

  fuse(): never {
    unimplemented();
  }

  inspect(f: (item: T) => unknown): never {
    unimplemented(`Implement this method. ${f}`);
  }

  collect<R, T2 extends FromIterator<T, R>>(t: T2): R {
    return t.from_iter(this);
  }

  partition<T2, R>(t: T2, f: (item: T) => boolean): [R, R] {
    unimplemented(`Implement this method. ${t} ${f}`);
  }

  fold<B>(init: B, f: (acum: B, item: T) => B): B {
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

  reduce(f: (item: T) => T): Option<T> {
    const first = this.next();
    if (first.is_none()) {
      return None();
    }
    return Some(this.fold(first.unwrap(), f));
  }

  all(f: (item: T) => boolean): boolean {
    return this.try_fold(
      ControlFlow,
      undefined as void,
      (_, item) => {
        if (f(item)) {
          return ControlFlow.Continue(undefined as void);
        } else {
          return ControlFlow.Break<unknown, void>(undefined as unknown);
        }
      }
    ).is_continue();
  }

  try_fold<B, R extends TryInstance<B, unknown>>(
    type: { from_output(output: B): R },
    init: B,
    f: (acum: B, item: T) => R,
  ): R {
    let acum = init;

    while (true) {
      const val = this.next();
      if (val.is_none()) {
        break;
      }

      const result = f(acum, val.unwrap());
      const flow = result.branch();
      if (flow.is_break()) {
        return result;
      }
      acum = flow.unwrap_continue();
    }

    return type.from_output(acum);
  }
}

export interface FromIterator<T, R> {
  from_iter(iter: RIterator<T>): R
}
