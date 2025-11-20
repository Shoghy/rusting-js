import { catchUnwindAsync } from "./catch.ts";

export function StaticImplements<T>() {
  return <U extends T>(_: U) => {};
}

export function copyTo(dest: object, src: object): void {
  Object.setPrototypeOf(dest, Object.getPrototypeOf(src));
  Object.defineProperties(dest, Object.getOwnPropertyDescriptors(src));
}

export interface PromiseWithResolvers<T, E> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (value?: E) => void;
}

export function promiseWithResolvers<T, E = Error>(): PromiseWithResolvers<
  T,
  E
> {
  let resolve!: (value: T) => void;
  let reject!: (value?: E) => void;

  const promise = new Promise<T>((rsv, rjc) => {
    resolve = rsv;
    reject = rjc;
  });

  return { promise, resolve, reject };
}

export function safeFetch(...params: Parameters<typeof fetch>) {
  return catchUnwindAsync(() => fetch(...params));
}

const Omit = Symbol();
type Omit = typeof Omit;
function omit(): Omit {
  return Omit;
}
const Collect = Symbol();
type Collect<T> = { [Collect]: T };
function collect<T>(v: T): Collect<T> {
  return { [Collect]: v };
}

const Stop = Symbol();
type Stop<T> = { [Stop]: T };
function stop<_>(): typeof Stop;
function stop<T>(value: T): Stop<T>;
function stop<T>(...values: T[]): Stop<T> | typeof Stop {
  if (values.length === 0) {
    return Stop;
  }

  return { [Stop]: values[0] };
}

const funcs = Object.freeze({ stop, collect, omit });
/**
 * Iterates over an iterable and processes each value using a callback
 * that may:
 *
 * - **collect**: return a value to be included in the result array
 * - **omit**: skip collecting a value for the current iteration
 * - **stop**: terminate iteration early, optionally collecting a final value
 *
 * This provides fine-grained loop control similar to `break`, `continue`,
 * and `return`, but expressed functionally.
 *
 * @example
 * // Collect even numbers doubled
 * const result = mapLoop([1,2,3,4], ({ collect, omit }, v) => {
 *   if (v % 2 === 0) return collect(v * 2);
 *   return omit();
 * });
 * // result = [4, 8]
 *
 * @example
 * // Stop after finding a match
 * const result = mapLoop([10,20,30], ({ stop, collect }, v) => {
 *   if (v === 30) return stop("found");
 *   return collect(v);
 * });
 * // result = [10,20,"found"]
 */
export function mapLoop<T, R>(
  iter: Iterable<T>,
  func: (
    funcs: {
      stop: typeof stop<R>;
      collect: typeof collect<R>;
      omit: typeof omit;
    },
    val: T,
    index: number,
    collectedCount: number,
  ) => typeof Stop | Stop<R> | Collect<R> | Omit,
): R[] {
  let index = 0;
  const mapped: R[] = [];
  for (const val of iter) {
    const result = func(funcs, val, index, mapped.length);
    index += 1;

    if (result === Stop) break;
    if (result === Omit) continue;
    if (Stop in result) {
      mapped.push(result[Stop]);
      break;
    }

    mapped.push(result[Collect]);
  }

  return mapped;
}
