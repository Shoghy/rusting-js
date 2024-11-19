/* eslint-disable @typescript-eslint/no-var-requires */
import { None, type Option, Some } from "../enums/option.ts";
import { Err, Ok, type Result } from "../enums/result.ts";
import { unimplemented } from "../panic.ts";
import type { TryInstance } from "./try_trait.ts";
import { ControlFlow } from "../enums/control_flow.ts";

/**
 * ## This is a "trait". You should not create an instance directly.
 */
export abstract class RIterator<T> {
  [Symbol.iterator]!: () => Generator<T, void>;

  constructor() {
    this[Symbol.iterator] = function* () {
      while (true) {
        const val = this.next();
        if (val.is_none()) {
          break;
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

  abstract next(): Option<T>;

  count(): number {
    return this.fold(0, (count) => count + 1);
  }

  last(): Option<T> {
    return this.fold(None(), (_, x) => Some(x));
  }

  nth(n: number): Option<T> {
    if (this.advance_by(n).is_err()) {
      return None();
    }
    return this.next();
  }

  step_by(step: number): import("../iterators/step_by").StepBy<T> {
    return new StepBy(this, step);
  }

  chain(other: RIterator<T>): import("../iterators/chain").Chain<T> {
    return new Chain(this, other);
  }

  zip<U>(other: RIterator<U>): never {
    unimplemented(
      `The return type by this method should, each time next is called, return an array of typeof [T, U] where T is an element in ${this} and U is an element in ${other}`,
    );
  }

  intersperse(separator: T): never {
    unimplemented(
      `The return type of this method should "add" ${separator} between each element in ${this}`,
    );
  }

  interperse_with(separator: () => T): never {
    unimplemented(`${separator}`);
  }

  map<B>(f: (value: T) => B): never {
    unimplemented(
      `The return type of this method should run the function ${f} for each element and return its returned value.`,
    );
  }

  for_each(f: (value: T) => unknown): void {
    this.fold(undefined as void, (_, item) => f(item));
  }

  filter(predicate: (value: T) => boolean): never {
    unimplemented(
      `The return type of this method should return only the values that return true after checking them with ${predicate} omiting the others`,
    );
  }

  filter_map<B>(f: (value: T) => Option<B>): never {
    unimplemented(
      `The return type of this method should return only the values that return Some after checking them with ${f} omiting the others`,
    );
  }

  enumerate(): never {
    unimplemented(
      "The return type of this method should return an Array with 2 items, the first one being the index of the element and the second one being the element",
    );
  }

  peekable(): never {
    unimplemented(
      'The return type of this method should let you "peek" which means it will return the next element of the iterator without consuming it.',
    );
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

  flat_map<U>(f: () => U) {
    unimplemented(
      `I am not sure of how to implement this, or if it can be implemented. ${f}`,
    );
  }

  flatten() {
    unimplemented(
      "I am not sure of how to implement this, or if it can be implemented",
    );
  }

  fuse(): never {
    unimplemented(
      "An iterator that after finding a `None` will just return `None`",
    );
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

  partition_in_place(predicate: (item: T) => boolean): number {
    unimplemented(
      `I am not sure of how to implement this, or if it can be implemented. ${predicate}`,
    );
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

  try_foreach() {
    unimplemented();
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
    return first.match({
      Some: (value) => Some(this.fold(value, f)),
      None: () => None(),
    });
  }

  try_reduce() {
    unimplemented();
  }

  all(f: (item: T) => boolean): boolean {
    return this.try_fold(ControlFlow, undefined as void, (_, item) => {
      if (f(item)) {
        return ControlFlow.Continue(undefined as void);
      } else {
        return ControlFlow.Break<unknown, void>(undefined as unknown);
      }
    }).is_continue();
  }

  any() {
    unimplemented();
  }

  find() {
    unimplemented();
  }

  find_map() {
    unimplemented();
  }

  try_find() {
    unimplemented();
  }

  position() {
    unimplemented();
  }

  max_by() {
    unimplemented();
  }

  min_by() {
    unimplemented();
  }

  rev() {
    unimplemented();
  }

  cycle() {
    unimplemented();
  }

  size_hint(): [number, Option<number>] {
    return [0, None()];
  }
}

export interface FromIterator<T, R> {
  from_iter(iter: RIterator<T>): R;
}

export interface StepByImpl<I> {
  spec_next(): Option<I>;
  spec_size_hint(): [number, Option<number>];
  spec_nth(n: number): Option<I>;
  spec_try_fold<Acc, R extends TryInstance<Acc, unknown>>(
    type: { from_output(output: Acc): R },
    acc: Acc,
    f: (acc: Acc, item: I) => R,
  ): R;
  spec_fold<Acc>(acc: Acc, f: (acc: Acc, item: I) => Acc): Acc;
}

const StepBy = require("../iterators/step_by")
  .StepBy as typeof import("../iterators/step_by").StepBy;
const Chain = require("../iterators/chain")
  .Chain as typeof import("../iterators/chain").Chain;
