/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import { None, type Option, Some } from "../enums/option.ts";
import { Err, Ok, type Result } from "../enums/result.ts";
import { unimplemented } from "../panic.ts";
import { ControlFlow } from "../enums/control_flow.ts";
import type { TryInstance, TryStatic } from "./try_trait.ts";

export abstract class RIterator<T> implements Iterable<T> {
  *[Symbol.iterator]() {
    while (true) {
      const val = this.next();
      if (val.isNone()) {
        break;
      }
      yield val.unwrap();
    }
  }

  advanceBy(n: number): Result<void, number> {
    for (let i = 0; i < n; ++i) {
      if (this.next().isNone()) {
        return Err(n - i);
      }
    }
    return Ok();
  }

  abstract next(): Option<T>;

  count(): number {
    return this.fold(0, (count) => count + 1);
  }

  last(): Option<T> {
    return this.fold(None(), (_, x) => Some(x));
  }

  nth(n: number): Option<T> {
    if (this.advanceBy(n).isErr()) {
      return None();
    }
    return this.next();
  }

  stepBy(step: number): import("../iterators/step_by").StepBy<T> {
    return new StepBy(this, step);
  }

  chain(other: RIterator<T>): import("../iterators/chain").Chain<T> {
    return new Chain(this, other);
  }

  zip<U>(other: RIterator<U>): import("../iterators/zip").Zip<T, U> {
    return new Zip(this, other);
  }

  intersperse(separator: T): import("../iterators/intersperse").Intersperse<T> {
    return new Intersperse(this, () => separator);
  }

  intersperseWith(
    separator: () => T,
  ): import("../iterators/intersperse").Intersperse<T> {
    return new Intersperse(this, separator);
  }

  map<B>(f: (value: T) => B): import("../iterators/map").Map<T, B> {
    return new Map(this, f);
  }

  forEach(f: (value: T) => unknown): void {
    this.fold(undefined as void, (_, item) => f(item));
  }

  filter(predicate: (value: T) => boolean): never {
    unimplemented(
      `The return type of this method should return only the values that return true after checking them with ${predicate} omitting the others`,
    );
  }

  filterMap<B>(f: (value: T) => Option<B>): never {
    unimplemented(
      `The return type of this method should return only the values that return Some after checking them with ${f} omitting the others`,
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

  skipWhile(predicate: () => boolean): never {
    unimplemented(`Implement this method. ${predicate}`);
  }

  takeWhile(predicate: () => boolean): never {
    unimplemented(`Implement this method. ${predicate}`);
  }

  mapWhile(predicate: () => boolean): never {
    unimplemented(`Implement this method. ${predicate}`);
  }

  skip(n: number): never {
    unimplemented(`Implement this method. ${n}`);
  }

  take(n: number): never {
    unimplemented(`Implement this method. ${n}`);
  }

  scan<ST, B>(initialState: ST, f: (st: ST, item: T) => Option<B>): never {
    unimplemented(`Implement this method. ${initialState} ${f}`);
  }

  flatMap<U>(f: () => U) {
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
    return t.fromIter(this);
  }

  partition<T2, R>(t: T2, f: (item: T) => boolean): [R, R] {
    unimplemented(`Implement this method. ${t} ${f}`);
  }

  partitionInPlace(predicate: (item: T) => boolean): number {
    unimplemented(
      `I am not sure of how to implement this, or if it can be implemented. ${predicate}`,
    );
  }

  tryFold<B, R extends TryInstance<B, R>>(
    type: TryStatic<B, R>,
    init: B,
    f: (accum: B, item: T) => R,
  ): R {
    let accum = init;

    while (true) {
      const val = this.next();
      if (val.isNone()) {
        break;
      }

      const result = f(accum, val.unwrap());
      const flow = result.branch();
      if (flow.isBreak()) {
        return result;
      }
      accum = flow.unwrapContinue();
    }

    return type.fromOutput(accum) as R;
  }

  tryForeach() {
    unimplemented();
  }

  fold<B>(init: B, f: (accum: B, item: T) => B): B {
    let accum = init;

    while (true) {
      const val = this.next();
      if (val.isNone()) {
        break;
      }
      accum = f(accum, val.unwrap());
    }

    return accum;
  }

  reduce(f: (item: T) => T): Option<T> {
    const first = this.next();
    return first.match({
      Some: (value) => Some(this.fold(value, f)),
      None: () => None(),
    });
  }

  tryReduce() {
    unimplemented();
  }

  all(f: (item: T) => boolean): boolean {
    return this.tryFold(ControlFlow, undefined as void, (_, item) => {
      if (f(item)) {
        return ControlFlow.Continue(undefined as void);
      } else {
        return ControlFlow.Break<unknown, void>(undefined as unknown);
      }
    }).isContinue();
  }

  any() {
    unimplemented();
  }

  find() {
    unimplemented();
  }

  findMap() {
    unimplemented();
  }

  tryFind() {
    unimplemented();
  }

  position() {
    unimplemented();
  }

  maxBy() {
    unimplemented();
  }

  minBy() {
    unimplemented();
  }

  rev() {
    unimplemented();
  }

  cycle() {
    unimplemented();
  }
}

export interface FromIterator<T, R> {
  fromIter(iter: RIterator<T>): R;
}

const StepBy = require("../iterators/step_by.ts")
  .StepBy as typeof import("../iterators/step_by.ts").StepBy;
const Chain = require("../iterators/chain.ts")
  .Chain as typeof import("../iterators/chain").Chain;
const Zip = require("../iterators/zip.ts")
  .Zip as typeof import("../iterators/zip.ts").Zip;
const Map = require("../iterators/map.ts")
  .Map as typeof import("../iterators/map.ts").Map;
const Intersperse = require("../iterators/intersperse.ts")
  .Intersperse as typeof import("../iterators/intersperse.ts").Intersperse;
