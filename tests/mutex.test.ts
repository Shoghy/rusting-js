import { test, describe, expect } from "bun:test";
import { Mutex } from "../src/mutex";
import { RandomInt } from "./random";
import { Err, Ok } from "../src/enums/result";

// ----------------- Mutex methods -----------------

describe("Testing `get_lockers_count` method", () => {
  test("No lockers", () => {
    const m = new Mutex(1);
    expect(m.get_lockers_count()).toBe(0);
  });

  test("Multiple lockers", () => {
    const m = new Mutex(2);
    const num = RandomInt(10, 100);
    for (let i = 0; i < num; ++i) {
      m.lock();
    }
    expect(m.get_lockers_count()).toBe(num);
  });

  test("Locking and freeing", async () => {
    const m = new Mutex([1, 2, 3]);
    const lock1 = await m.lock();
    const lock2 = m.lock();

    expect(m.get_lockers_count()).toBe(2);

    lock1.unlock();
    expect(m.get_lockers_count()).toBe(1);

    (await lock2).unlock();
    expect(m.get_lockers_count()).toBe(0);
  });
});

describe("Testing `is_locked` method", () => {
  test("No lockers", () => {
    const m = new Mutex("Friday");

    expect(m.is_locked()).toBeFalse();
  });

  test("Locking and unlocking", async () => {
    const m = new Mutex("Night");
    const lock = await m.lock();

    expect(m.is_locked()).toBeTrue();

    lock.unlock();
    expect(m.is_locked()).toBeFalse();
  });

  test("Locking and unlocking (multiple)", async () => {
    const m = new Mutex("Funkin'");
    const lock1 = await m.lock();
    const lock2 = m.lock();

    expect(m.is_locked()).toBeTrue();

    lock1.unlock();
    expect(m.is_locked()).toBeTrue();

    (await lock2).unlock();
    expect(m.is_locked()).toBeFalse();
  });
});

describe("Testing `forced_unlock` method", () => {
  test("`has_lock` should return false", async () => {
    const m = new Mutex(6);
    const lock = await m.lock();

    m.forced_unlock();
    expect(lock.has_lock()).toBeFalse();
  });

  test("`get_lockers_count` should return zero", () => {
    const m = new Mutex(6);
    const num = RandomInt(69, 420);

    for (let i = 0; i < num; ++i) {
      m.lock();
    }

    expect(m.get_lockers_count()).toBe(num);

    m.forced_unlock();
    expect(m.get_lockers_count()).toBe(0);
  });

  test("All of the non try `MutexGuard` methods should panic", async () => {
    const m = new Mutex(6);
    const lock = await m.lock();

    m.forced_unlock();

    expect(() => lock.get()).toThrowError(
      "Calling `get` when `MutexGuard` has been unlocked",
    );
    expect(() => lock.set(1)).toThrowError(
      "Calling `set` when `MutexGuard` has been unlocked",
    );
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

    expect(lock.get()).toEqual([1, 2, 3, 4, 5]);
  });

  test("Should throw an error after has been unlocked", async () => {
    const m = new Mutex("This value will not be used");
    const lock = await m.lock();

    lock.unlock();

    expect(() => lock.get()).toThrowError(
      "Calling `get` when `MutexGuard` has been unlocked",
    );
  });
});

describe("Testing `set` method", () => {
  //https://www.youtube.com/watch?v=QcZNV0HVo9Y
  test("Should update the value of `Mutex`", async () => {
    const m = new Mutex("Já pensou se a gente for");
    const lock1 = await m.lock();

    lock1.set("Um pouco mais ousado nesse nosso lance?");
    expect(lock1.get()).toBe("Um pouco mais ousado nesse nosso lance?");

    lock1.unlock();

    const lock2 = await m.lock();
    expect(lock2.get()).toBe("Um pouco mais ousado nesse nosso lance?");
  });

  test("Should throw an error after has been unlocked", async () => {
    const m = new Mutex("Já pensou, transformar");
    const lock = await m.lock();
    lock.unlock();

    expect(() => lock.set("A nossa amizade num lindo romance?")).toThrowError(
      "Calling `set` when `MutexGuard` has been unlocked",
    );
  });
});

describe("Testing `has_lock` method", () => {
  test("Should return true", async () => {
    const m = new Mutex(33);
    const lock = await m.lock();

    expect(lock.has_lock()).toBeTrue();
  });

  test("Should return false", async () => {
    const m = new Mutex(33);
    const lock = await m.lock();
    lock.unlock();

    expect(lock.has_lock()).toBeFalse();
  });
});

describe("Testing `try_get` method", () => {
  test("Should return the value of `Mutex` wrapped in a `Ok`", async () => {
    const m = new Mutex("Fun 2 Rhyme");
    const lock = await m.lock();

    expect(lock.try_get()).toEqual(Ok("Fun 2 Rhyme"));
  });

  test("Should return `Err`", async () => {
    const m = new Mutex("Los Hermanos Pinzones");
    const lock = await m.lock();
    lock.unlock();

    expect(lock.try_get()).toEqual(
      Err(new Error("Calling `get` when `MutexGuard` has been unlocked")),
    );
  });
});

describe("Testing `try_set` method", () => {
  test("Should change the value of `Mutex` and return `Ok`", async () => {
    const m = new Mutex("(-_-)");
    const lock1 = await m.lock();

    const result = lock1.try_set("]:)");
    expect(result).toEqual(Ok());
    expect(lock1.get()).toBe("]:)");

    lock1.unlock();
    const lock2 = await m.lock();
    expect(lock2.get()).toBe("]:)");
  });

  test("Should not change the value of `Mutex` and return `Err`", async () => {
    const m = new Mutex(":}");
    const lock1 = await m.lock();
    lock1.unlock();

    const result = lock1.try_set("0|0");
    expect(result).toEqual(
      Err(new Error("Calling `set` when `MutexGuard` has been unlocked")),
    );

    const lock2 = await m.lock();
    expect(lock2.get()).toBe(":}");
    lock2.unlock();
  });
});

describe("Testing `try_unlock` method", () => {
  test("Should `unlock` the `Mutex` and return `Ok`", async () => {
    const m = new Mutex(69);
    const lock = await m.lock();

    const result = lock.try_unlock();
    expect(result).toEqual(Ok());
    expect(lock.has_lock()).toBeFalse();
  });

  test("Should just return an `Err`", async () => {
    const m = new Mutex(420);
    const lock = await m.lock();
    lock.unlock();

    const result = lock.try_unlock();
    expect(result).toEqual(
      Err(new Error("Calling `unlock` when `MutexGuard` has been unlocked")),
    );
  });
});
