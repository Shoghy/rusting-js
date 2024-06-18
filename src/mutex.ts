export function Mutex<T>(value: T) {
  let locker: Promise<unknown>;
  let lockers_count = 0;

  return {
    is_locked() {
      return lockers_count > 0;
    },
    async lock() {
      lockers_count += 1;

      const prevLocker = locker;

      let resolvePromise: (v?: unknown) => void;
      locker = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      await prevLocker;

      let get = () => value;

      let set = (val: T) => {
        value = val;
      };

      let unlock = () => {
        get = undefined as never;
        set = undefined as never;
        unlock = undefined as never;
        resolvePromise();
        lockers_count -= 1;
      };

      const mutexGuard = {
        get: () => get(),
        set: (val: T) => set(val),
        unlock: () => unlock(),
      };

      return mutexGuard;
    },
  };
}