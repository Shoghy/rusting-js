import { catch_unwind, panic } from "./panic";
import { type Result } from "./enums/result";

const get_symbol = Symbol("get");
const set_symbol = Symbol("set");
const locker_symbol = Symbol("locker");

export class Mutex<T> {
  private readonly [get_symbol]: () => T;
  private readonly [set_symbol]: (val: T) => void;
  private [locker_symbol]!: Promise<unknown>;

  protected unlockers: {
    [key: symbol]: () => void
  } = {};
  protected lockers_count = 0;

  constructor(value: T) {
    this[get_symbol] = () => value;
    this[set_symbol] = (val: T) => {
      value = val;
    };
  }

  get_lockers_count(): number {
    return this.lockers_count;
  }

  is_locked(): boolean {
    return this.lockers_count > 0;
  }

  /**
   * Unlocks the Mutex, without needing the lockers.
   * ## This function can be error prone. Its use is not recommended
   */
  forced_unlock() {
    const keys = Object.getOwnPropertySymbols(this.unlockers);
    for (const key of keys) {
      this.unlockers[key]();
    }
  }

  async lock(): Promise<MutexGuard<T>> {
    this.lockers_count += 1;

    const prev_locker = this[locker_symbol];

    let resolve_promise: () => void = () => { };

    this[locker_symbol] = new Promise((resolve) => {
      const unlocker_key = Symbol();
      this.unlockers[unlocker_key] = () => unlock();

      resolve_promise = () => {
        this.lockers_count -= 1;
        delete this.unlockers[unlocker_key];
        resolve(undefined);
      };
    });

    const mutex_guard = new MutexGuard(this[get_symbol], this[set_symbol], resolve_promise);
    const unlock = mutex_guard.unlock;

    await prev_locker;

    return mutex_guard;
  }
}

export class MutexGuard<T> {
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
