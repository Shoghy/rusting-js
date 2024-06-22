export function Mutex<T>(value: T) {
  let currentLocker: Promise<unknown>;
  let lockers_count = 0;
  const unlockers: {
    [key: symbol]: () => void,
  } = {};

  return {
    is_locked() {
      return lockers_count > 0;
    },
    /**
     * Unlocks the Mutex, without needing the lockers.
     * ## This function can be error prone its used is not recommended
     */
    forced_unlock() {
      const keys = Object.getOwnPropertySymbols(unlockers);
      for(const key of keys){
        unlockers[key]();
      }
    },
    async lock() {
      lockers_count += 1;

      const prevLocker = currentLocker;

      let resolvePromise: (v?: unknown) => void;
      currentLocker = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      let get = () => value;

      let set = (val: T) => {
        value = val;
      };

      const unlockerKey = Symbol();

      let unlock = () => {
        get = undefined as never;
        set = undefined as never;
        unlock = undefined as never;
        delete unlockers[unlockerKey];
        lockers_count -= 1;
        resolvePromise();
      };

      unlockers[unlockerKey] = unlock;

      await prevLocker;

      const mutexGuard = {
        get: () => get(),
        set: (val: T) => set(val),
        unlock: () => unlock(),
      };

      return mutexGuard;
    },
  };
}