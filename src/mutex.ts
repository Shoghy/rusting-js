import { catchUnwind, panic } from "./panic";
import { type Result } from "./enums/result";
import { ManualPromise } from "./utils";

export class Mutex<T> {
  #value: T;

  #locker?: ManualPromise<unknown>;
  #unlockers: Record<symbol, () => void> = {};
  #lockersCount = 0;

  constructor(value: T) {
    this.#value = value;
  }

  get lockersCount(): number {
    return this.#lockersCount;
  }

  get isLocked(): boolean {
    return this.#lockersCount > 0;
  }

  /**
   * Unlocks the Mutex, without needing the lockers.
   * ## This function can be error prone. Its use is not recommended
   */
  forcedUnlock() {
    const keys = Object.getOwnPropertySymbols(this.#unlockers);
    for (const key of keys) {
      this.#unlockers[key]();
    }
  }

  async lock(): Promise<MutexGuard<T>> {
    this.#lockersCount += 1;

    const prevLocker = this.#locker;
    const promise = new ManualPromise();

    const resolvePromise = () => {
      this.#lockersCount -= 1;
      delete this.#unlockers[unlockerKey];
      promise.resolve(undefined);
    };

    const mutexGuard = new MutexGuard(
      () => this.#value,
      (value) => {
        this.#value = value;
      },
      resolvePromise,
    );

    /**
     * I create this constant so if the user change the value of `unlock` in `mutexGuard`
     * I will still have access to the original `unlock` function, so it can be used
     * to maybe produce bugs with `forcedUnlock`
     */
    const unlock = mutexGuard.unlock;
    const unlockerKey = Symbol();
    this.#unlockers[unlockerKey] = () => unlock();

    await prevLocker?.wait();

    return mutexGuard;
  }
}

export class MutexGuard<T> {
  [Symbol.dispose]() {
    this.tryUnlock();
  }

  #get: () => T;
  #set: (val: T) => void;
  #unlock: () => void;
  #hasLock: boolean;

  get get() {
    return this.#get;
  }

  get set() {
    return this.#set;
  }

  get unlock() {
    return this.#unlock;
  }

  get hasLock() {
    return this.#hasLock;
  }

  constructor(get: () => T, set: (val: T) => void, resolver: () => void) {
    this.#get = get;
    this.#set = set;
    this.#hasLock = true;

    this.#unlock = () => {
      if (!this.#hasLock) {
        panic("Calling `unlock` when `MutexGuard` has been unlocked");
      }
      this.#hasLock = false;

      this.#get = () =>
        panic("Calling `get` when `MutexGuard` has been unlocked");
      this.#set = () =>
        panic("Calling `set` when `MutexGuard` has been unlocked");

      resolver();
    };
  }

  tryGet(): Result<T, Error> {
    return catchUnwind(this.#get);
  }

  trySet(value: T): Result<void, Error> {
    return catchUnwind(() => this.#set(value));
  }

  tryUnlock(): Result<void, Error> {
    return catchUnwind(this.#unlock);
  }
}
