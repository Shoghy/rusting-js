import { expect, test } from "bun:test";
import { panic } from "../src/panic.ts";
import { defer, deferrableFunc } from "../src/defer.ts";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

test("Sync defer", (done) => {
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

test("Async defer", async (done) => {
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

test("Sync throwing errors", (done) => {
  const tester = deferrableFunc((p) => {
    defer(p, () => {
      done();
    });

    panic();
  });

  expect(tester).toThrowError();
});

test("Async throwing errors", async (done) => {
  const tester = deferrableFunc(async (p) => {
    await sleep(5);

    defer(p, () => {
      done();
    });

    await sleep(5);
    panic();
  });

  expect(tester).toThrowError();
});
