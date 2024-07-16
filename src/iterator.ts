import { Option } from "./option";

export interface Iterator<T>{
  next(): Option<T>;
  count(): number;
  last(): Option<T>;
  nth(n: number): Option<T>;
  /**@todo Create return type */
  step_by(step: number): never;
  /**@todo Create return type */
  chain(other: Iterator<T>): never;
  /**@todo Create return type */
  zip<U>(other: Iterator<U>): never;
  /**@todo Create return type */
  intersperse(separator: T): never;
  /**@todo Create return type */
  map<U>(f: (value: T) => U): never;
  for_each(f: (value: T) => unknown): void;
}
