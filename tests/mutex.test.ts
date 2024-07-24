import { test, describe, expect } from "bun:test";
import { Mutex } from "../src/mutex";
import { RandomInt } from "./random";

describe("Testing `get_lockers_count` method", () => {
  test("No lockers", () => {
    const m = new Mutex(1);
    expect(m.get_lockers_count()).toBe(0);
  });

  test("Multiple lockers", () => {
    const m = new Mutex(2);
    const num = RandomInt(10, 100);
    for(let i = 0; i < num; ++i){
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
    const m = new Mutex("F");

    expect(m.is_locked()).toBeFalse();
  });

  test("Locking and unlocking", async () => {
    const m = new Mutex("N");
    const lock = await m.lock();

    expect(m.is_locked()).toBeTrue();

    lock.unlock();
    expect(m.is_locked()).toBeFalse();
  });

  test("Locking and unlocking (multiple)", async () => {
    const m = new Mutex("F");
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

    for(let i = 0; i < num; ++i){
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

    expect(() => lock.get()).toThrowError("Calling `get` when `MutexGuard` has been unlocked");
    expect(() => lock.set(1)).toThrowError("Calling `set` when `MutexGuard` has been unlocked");
    expect(() => lock.unlock()).toThrowError("Calling `unlock` when `MutexGuard` has been unlocked");
  });
});