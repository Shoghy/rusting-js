import { test, describe, expect } from "bun:test";
import { Mutex } from "../src/mutex.ts";
import { Ok } from "../src/enums/result.ts";
import { randomInt } from "./random.ts";

// ----------------- Mutex methods -----------------

describe("Testing `getLockersCount` method", () => {
  test("No lockers", () => {
    const m = new Mutex(1);
    expect(m.lockersCount).toBe(0);
  });

  test("Multiple lockers", () => {
    const m = new Mutex(2);
    const num = randomInt(10, 100);
    for (let i = 0; i < num; ++i) {
      m.lock();
    }
    expect(m.lockersCount).toBe(num);
  });

  test("Locking and freeing", async () => {
    const m = new Mutex([1, 2, 3]);
    const lock1 = await m.lock();
    const lock2 = m.lock();

    expect(m.lockersCount).toBe(2);

    lock1.unlock();
    expect(m.lockersCount).toBe(1);

    (await lock2).unlock();
    expect(m.lockersCount).toBe(0);
  });
});

describe("Testing `isLocked` method", () => {
  test("No lockers", () => {
    const m = new Mutex("Friday");

    expect(m.isLocked).toBeFalse();
  });

  test("Locking and unlocking", async () => {
    const m = new Mutex("Night");
    const lock = await m.lock();

    expect(m.isLocked).toBeTrue();

    lock.unlock();
    expect(m.isLocked).toBeFalse();
  });

  test("Locking and unlocking (multiple)", async () => {
    const m = new Mutex("Funkin'");
    const lock1 = await m.lock();
    const lock2 = m.lock();

    expect(m.isLocked).toBeTrue();

    lock1.unlock();
    expect(m.isLocked).toBeTrue();

    (await lock2).unlock();
    expect(m.isLocked).toBeFalse();
  });
});

describe("Testing `forcedUnlock` method", () => {
  test("`hasLock` should return false", async () => {
    const m = new Mutex(6);
    const lock = await m.lock();

    m.forcedUnlock();
    expect(lock.hasLock).toBeFalse();
  });

  test("`getLockersCount` should return zero", () => {
    const m = new Mutex(6);
    const num = randomInt(69, 420);

    for (let i = 0; i < num; ++i) {
      m.lock();
    }

    expect(m.lockersCount).toBe(num);

    m.forcedUnlock();
    expect(m.lockersCount).toBe(0);
  });

  test("All of the non try `MutexGuard` methods should panic", async () => {
    const m = new Mutex(6);
    const lock = await m.lock();

    m.forcedUnlock();

    expect(() => lock.value).toThrowError(
      "Calling `get` when `MutexGuard` has been unlocked",
    );
    expect(() => {
      lock.value = 1;
    }).toThrowError("Calling `set` when `MutexGuard` has been unlocked");
    expect(() => lock.unlock()).toThrowError(
      "Calling `unlock` when `MutexGuard` has been unlocked",
    );
  });
});

describe("Testing `lock` method", async () => {
  test("Testing order of execution", async () => {
    async function notAwaitedAsync() {
      const lock2 = await m.lock();
      val = 2;
      lock2.unlock();
    }

    let val = 1;
    //https://www.youtube.com/watch?v=Yw6u6YkTgQ4
    const m = new Mutex("Hello World... program to work and not to feel");
    const lock1 = await m.lock();

    notAwaitedAsync();

    expect(val).toBe(1);
    lock1.unlock();

    const lock3 = await m.lock();
    expect(val).toBe(2);
    lock3.unlock();
  });
});

// ----------------- MutexGuard methods -----------------

describe("Testing `get` method", () => {
  test("Should return the value hold by `Mutex`", async () => {
    const m = new Mutex([1, 2, 3, 4, 5]);
    const lock = await m.lock();

    expect(lock.value).toEqual([1, 2, 3, 4, 5]);
  });

  test("Should throw an error after has been unlocked", async () => {
    const m = new Mutex("This value will not be used");
    const lock = await m.lock();

    lock.unlock();

    expect(() => lock.value).toThrowError(
      "Calling `get` when `MutexGuard` has been unlocked",
    );
  });
});

describe("Testing `set` method", () => {
  //https://www.youtube.com/watch?v=QcZNV0HVo9Y
  test("Should update the value of `Mutex`", async () => {
    const m = new Mutex("Já pensou se a gente for");
    const lock1 = await m.lock();

    lock1.value = "Um pouco mais ousado nesse nosso lance?";
    expect(lock1.value).toBe("Um pouco mais ousado nesse nosso lance?");

    lock1.unlock();

    const lock2 = await m.lock();
    expect(lock2.value).toBe("Um pouco mais ousado nesse nosso lance?");
  });

  test("Should throw an error after has been unlocked", async () => {
    const m = new Mutex("Já pensou, transformar");
    const lock = await m.lock();
    lock.unlock();

    expect(() => {
      lock.value = "A nossa amizade num lindo romance?";
    }).toThrowError("Calling `set` when `MutexGuard` has been unlocked");
  });
});

describe("Testing `hasLock` method", () => {
  test("Should return true", async () => {
    const m = new Mutex(33);
    const lock = await m.lock();

    expect(lock.hasLock).toBeTrue();
  });

  test("Should return false", async () => {
    const m = new Mutex(33);
    const lock = await m.lock();
    lock.unlock();

    expect(lock.hasLock).toBeFalse();
  });
});

describe("Testing `tryGet` method", () => {
  test("Should return the value of `Mutex` wrapped in a `Ok`", async () => {
    const m = new Mutex("Fun 2 Rhyme");
    const lock = await m.lock();

    expect(lock.tryGet()).toEqual(Ok("Fun 2 Rhyme"));
  });

  test("Should return `Err`", async () => {
    const m = new Mutex("Los Hermanos Pinzones");
    const lock = await m.lock();
    lock.unlock();

    const result = lock.tryGet();

    expect(result.isErr()).toBeTrue();
  });
});

describe("Testing `trySet` method", () => {
  test("Should change the value of `Mutex` and return `Ok`", async () => {
    const m = new Mutex("(-_-)");
    const lock1 = await m.lock();

    const result = lock1.trySet("]:)");
    expect(result).toEqual(Ok());
    expect(lock1.value).toBe("]:)");

    lock1.unlock();
    const lock2 = await m.lock();
    expect(lock2.value).toBe("]:)");
  });

  test("Should not change the value of `Mutex` and return `Err`", async () => {
    const m = new Mutex(":}");
    const lock1 = await m.lock();
    lock1.unlock();

    const result = lock1.trySet("0|0");
    expect(result.isErr()).toBeTrue();

    const lock2 = await m.lock();
    expect(lock2.value).toBe(":}");
    lock2.unlock();
  });
});

describe("Testing `tryUnlock` method", () => {
  test("Should `unlock` the `Mutex` and return `Ok`", async () => {
    const m = new Mutex(69);
    const lock = await m.lock();

    const result = lock.tryUnlock();
    expect(result).toEqual(Ok());
    expect(lock.hasLock).toBeFalse();
  });

  test("Should just return an `Err`", async () => {
    const m = new Mutex(420);
    const lock = await m.lock();
    lock.unlock();

    const result = lock.tryUnlock();
    expect(result.isErr()).toBeTrue();
  });
});

test("Mutex releases lock after using block", async () => {
  const m = new Mutex("Hola");
  let wasLockExecuted = false;

  await (async () => {
    using lock = await m.lock();
    wasLockExecuted = true;
    expect(lock.value).toBe("Hola");
  })();

  expect(wasLockExecuted).toBeTrue();
  expect(m.lockersCount).toBe(0);
});
