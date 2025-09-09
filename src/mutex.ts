import { catchUnwind, panic } from "./panic.ts";
import { type Result } from "./enums/result.ts";
import { ManualPromise } from "./utils.ts";

export class Mutex<T> {
  #value: T;

  #locker?: ManualPromise<void>;
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
    const promise = new ManualPromise<void>();

    const resolvePromise = () => {
      this.#lockersCount -= 1;
      delete this.#unlockers[unlockerKey];
      promise.resolve();
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

  get value(): T {
    const val = this.#get();
    if (typeof val !== "object" || val === null) {
      return val;
    }

    return new Proxy(val, {
      set: (target, p, newValue, receiver) => {
        if (!this.#hasLock) {
          panic("Changing property from `Mutex` object that has been unlocked");
        }

        return Reflect.set(target, p, newValue, receiver);
      },

      deleteProperty: (target, p) => {
        if (!this.#hasLock) {
          panic("Deleting property from `Mutex` object that has been unlocked");
        }

        return Reflect.deleteProperty(target, p);
      },

      setPrototypeOf: (target, v) => {
        if (!this.#hasLock) {
          panic(
            "Changing prototype from `Mutex` object that has been unlocked",
          );
        }

        return Reflect.setPrototypeOf(target, v);
      },

      defineProperty: (target, property, attributes) => {
        if (!this.#hasLock) {
          panic(
            "Adding a new property to `Mutex` object that has been unlocked",
          );
        }

        return Reflect.defineProperty(target, property, attributes);
      },

      preventExtensions: (target) => {
        if (!this.#hasLock) {
          panic(
            "Preventing extension on `Mutex` object that has been unlocked",
          );
        }

        return Reflect.preventExtensions(target);
      },

      get: (target, p, receiver) => {
        if (!this.#hasLock) {
          panic("Reading property of `Mutex` object that has been unlocked");
        }

        return Reflect.get(target, p, receiver);
      },
    });
  }

  set value(val: T) {
    this.#set(val);
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
    return catchUnwind(() => this.value);
  }

  trySet(value: T): Result<void, Error> {
    return catchUnwind(() => this.#set(value));
  }

  tryUnlock(): Result<void, Error> {
    return catchUnwind(this.#unlock);
  }
}
