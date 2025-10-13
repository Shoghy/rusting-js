import { expect, test } from "bun:test";
import { sleep } from "bun";
import { panic } from "../src/panic.ts";
import { defer, deferrableFunc } from "../src/defer.ts";

test("executes deferred functions after main function body", (done) => {
  const func = deferrableFunc((p) => {
    let i = 0;

    defer(p, () => {
      expect(i).toBe(1);
      done();
    });

    i += 1;
  });

  func();
});

test("executes deferred functions after awaited code in async deferrable function", async (done) => {
  const func = deferrableFunc(async (p) => {
    let text = "🥺";

    defer(p, () => {
      expect(text).toBe("👉👈");
      done();
    });

    await sleep(5);

    text = "👉👈";
  });

  await func();
});

test("executes deferred functions even when a panic occurs", (done) => {
  const tester = deferrableFunc((p) => {
    defer(p, () => {
      done();
    });

    panic();
  });

  expect(tester).toThrowError();
});

test("executes deferred functions in async deferrable function even after panic", (done) => {
  const tester = deferrableFunc(async (p) => {
    defer(p, () => {
      done();
    });

    await sleep(5);
    panic();
  });

  expect(tester).toThrowError();
});
