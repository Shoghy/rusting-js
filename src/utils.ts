import type { Result } from "./enums/result.ts";
import { catchUnwind, catchUnwindAsync, panic } from "./panic.ts";

export function StaticImplements<T>() {
  return <U extends T>(_: U) => {};
}

export function copyTo(dest: object, src: object): void {
  Object.setPrototypeOf(dest, Object.getPrototypeOf(src));
  Object.defineProperties(dest, Object.getOwnPropertyDescriptors(src));
}

export interface DeferObject {
  [Symbol.dispose](): void;
  [Symbol.asyncDispose](): Promise<void>;
}

/**
 * The `func` parameter is executed when the
 * function that called `defer` returns
 * or throw an error.
 *
 * To use it you just need to create a dummy
 * variable with the `using` keyword.
 * @example
 * function example() {
 *   using _d1 = defer(() => {
 *     console.log("AEUGH");
 *   });
 *
 *   console.log("Hello young lady");
 * }
 *
 * example();
 * //Hello young lady
 * //AEUGH
 */
export function defer(func: () => unknown): DeferObject {
  return {
    [Symbol.dispose]() {
      func();
    },

    async [Symbol.asyncDispose]() {
      await func();
    },
  };
}

export enum PromiseState {
  AWAITING,
  RESOLVED,
  REJECTED,
}

export class ManualPromise<T, E = Error> {
  #resolve!: (value: T | PromiseLike<T>) => void;
  #reject!: (value: E) => void;

  get state() {
    return this.#state;
  }

  get resolve() {
    return this.#resolve;
  }

  get reject() {
    return this.#reject;
  }

  #state: PromiseState;
  #promise: Promise<T>;

  constructor() {
    this.#state = PromiseState.AWAITING;

    this.#promise = new Promise((rsv, rjc) => {
      this.#resolve = (value) => {
        if (this.#state !== PromiseState.AWAITING) {
          panic(
            `Calling \`resolve\` on a promise that was ${PromiseState[this.#state]}`,
          );
        }
        rsv(value);
        this.#state = PromiseState.RESOLVED;
      };

      this.#reject = (err) => {
        if (this.#state !== PromiseState.AWAITING) {
          panic(
            `Calling \`resolve\` on a promise that was ${PromiseState[this.#state]}`,
          );
        }
        rjc(err);
        this.#state = PromiseState.REJECTED;
      };
    });
  }

  tryResolve(value: T | PromiseLike<T>): Result<void, Error> {
    return catchUnwind(() => this.#resolve(value));
  }

  tryReject(value: E): Result<void, Error> {
    return catchUnwind(() => this.#reject(value));
  }

  wait() {
    return catchUnwindAsync<T, E>(() => this.#promise);
  }
}
