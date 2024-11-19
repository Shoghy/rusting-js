import type { Result } from "./enums/result.ts";
import { catch_unwind, panic } from "./panic.ts";

export interface Mutex<T> {
  get_lockers_count(): number;
  is_locked(): boolean;
  /**
   * Unlocks the Mutex, without needing the lockers.
   * ## This function can be error prone. Its use is not recommended
   */
  forced_unlock(): void;
  lock(): Promise<MutexGuard<T>>;
}

export const Mutex = function <T>(this: Mutex<T>, value: T) {
  let lockers_count = 0;
  let locker: Promise<unknown> | undefined = undefined;
  const unlockers: Record<symbol, () => void> = {};

  const getFunc = () => value;

  const setFunc = (val: T) => {
    value = val;
  };

  this.get_lockers_count = function () {
    return lockers_count;
  };

  this.is_locked = function () {
    return lockers_count > 0;
  };

  this.forced_unlock = function () {
    const keys = Object.getOwnPropertySymbols(unlockers);
    for (const key of keys) {
      unlockers[key]();
    }
  };

  this.lock = async function () {
    lockers_count += 1;

    const prev_locker = locker;

    let resolve_promise = () => {};

    locker = new Promise((resolve) => {
      const unlocker_key = Symbol();
      unlockers[unlocker_key] = () => unlock();

      resolve_promise = () => {
        lockers_count -= 1;
        delete unlockers[unlocker_key];
        resolve(undefined);
      };
    });

    const mutex_guard = new MutexGuard(getFunc, setFunc, resolve_promise);

    /**
     * I create this constant so if the user change the value of `unlock` in `mutex_guard`
     * I will still have access to the original `unlock` function, so it can be used
     * to maybe produce bugs with `forced_unlock`
     */
    const unlock = mutex_guard.unlock;

    await prev_locker;

    return mutex_guard;
  };
} as unknown as new <T>(value: T) => Mutex<T>;

export interface MutexGuard<T> {
  get(): T;
  set(val: T): void;
  unlock(): void;
  has_lock(): boolean;
  try_get(): Result<T, Error>;
  try_set(val: T): Result<void, Error>;
  try_unlock(): Result<void, Error>;
}

export const MutexGuard = function <T>(
  this: MutexGuard<T>,
  get: () => T,
  set: (val: T) => void,
  resolver: () => void,
) {
  this.get = () => get();
  this.set = (val) => set(val);

  let has_lock = true;

  this.has_lock = () => has_lock;

  function unlock() {
    if (!has_lock) {
      panic("Calling `unlock` when `MutexGuard` has been unlocked");
    }
    has_lock = false;

    get = () => panic("Calling `get` when `MutexGuard` has been unlocked");
    set = () => panic("Calling `set` when `MutexGuard` has been unlocked");
    resolver();
  }

  this.unlock = () => unlock();

  this.try_get = () => catch_unwind(get);
  this.try_set = (val) => catch_unwind(() => set(val));
  this.try_unlock = () => catch_unwind(unlock);
} as unknown as new <T>(
  get: () => T,
  set: (val: T) => void,
  resolver: () => void,
) => MutexGuard<T>;
