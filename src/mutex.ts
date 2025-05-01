import { catch_unwind, panic } from "./panic";
import { type Result } from "./enums/result";
import { ManualPromise } from "./utils";

export class Mutex<T> {
  #value: T;

  #locker?: ManualPromise<unknown>;
  #unlockers: Record<symbol, () => void> = {};
  #lockers_count = 0;

  constructor(value: T) {
    this.#value = value;
  }

  get_lockers_count(): number {
    return this.#lockers_count;
  }

  is_locked(): boolean {
    return this.#lockers_count > 0;
  }

  /**
   * Unlocks the Mutex, without needing the lockers.
   * ## This function can be error prone. Its use is not recommended
   */
  forced_unlock() {
    const keys = Object.getOwnPropertySymbols(this.#unlockers);
    for (const key of keys) {
      this.#unlockers[key]();
    }
  }

  async lock(): Promise<MutexGuard<T>> {
    this.#lockers_count += 1;

    const prev_locker = this.#locker;
    const promise = new ManualPromise();

    const resolve_promise = () => {
      this.#lockers_count -= 1;
      delete this.#unlockers[unlocker_key];
      promise.resolve(undefined);
    };

    const mutex_guard = new MutexGuard(
      () => this.#value,
      (value) => {
        this.#value = value;
      },
      resolve_promise,
    );

    /**
     * I create this constant so if the user change the value of `unlock` in `mutex_guard`
     * I will still have access to the original `unlock` function, so it can be used
     * to maybe produce bugs with `forced_unlock`
     */
    const unlock = mutex_guard.unlock;
    const unlocker_key = Symbol();
    this.#unlockers[unlocker_key] = () => unlock();

    await prev_locker?.wait();

    return mutex_guard;
  }
}

export class MutexGuard<T> {
  [Symbol.dispose]() {
    this.try_unlock();
  }

  get: () => T;
  set: (val: T) => void;
  unlock: () => void;
  has_lock: () => boolean;

  constructor(get: () => T, set: (val: T) => void, resolver: () => void) {
    this.get = () => get();
    this.set = (val: T) => set(val);

    let has_lock = true;

    this.has_lock = () => has_lock;

    this.unlock = () => {
      if (!has_lock) {
        panic("Calling `unlock` when `MutexGuard` has been unlocked");
      }
      has_lock = false;

      get = () => panic("Calling `get` when `MutexGuard` has been unlocked");
      set = () => panic("Calling `set` when `MutexGuard` has been unlocked");
      resolver();
    };
  }

  try_get(): Result<T, Error> {
    return catch_unwind(this.get);
  }

  try_set(value: T): Result<void, Error> {
    return catch_unwind(() => this.set(value));
  }

  try_unlock(): Result<void, Error> {
    return catch_unwind(this.unlock);
  }
}
