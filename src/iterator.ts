import { Option } from "./enums";
import { unimplemented } from "./panic";

export class RIterator<T> {
  next(): Option<T> {
    unimplemented("This method should be override by any class that extends RIterator");
  }
  count(): number {
    unimplemented("This method should return the number of items and consume them");
  }
  last(): Option<T> {
    unimplemented("This method should return the last element in the RIterator");
  }
  nth(n: number): Option<T> {
    unimplemented(`This method should call next the ${n} times`);
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
    unimplemented(`This method should work, like its name says, like a foreach runing the ${f} function for each element.`);
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
  fold<B>(init: B, f: (item: T) => B): B {
    unimplemented(`Implement this method. ${init} ${f}`);
  }
  reduce(f: (item: T) => T): T {
    unimplemented(`Implement this method. ${f}`);
  }
}

export interface FromIterator<T, R> {
  from_iter(iter: RIterator<T>): R
}
