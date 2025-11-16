import { expect, test } from "bun:test";
import { sleep } from "bun";
import { catchUnwind, catchUnwindAsync } from "../src/catch.ts";
import { capturePromise, defer, deferrableFunc } from "../src/defer.ts";
import { panic } from "../src/panic.ts";

test("executes deferred functions after main function body", (done) => {
  const func = deferrableFunc((p) => {
    let i = 0;

    capturePromise(p, () => {
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

    capturePromise(p, () => {
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
    capturePromise(p, () => {
      done();
    });

    panic();
  });

  expect(tester).toThrowError();
});

test("executes deferred functions in async deferrable function even after panic", (done) => {
  const tester = deferrableFunc(async (p) => {
    capturePromise(p, () => {
      done();
    });

    await sleep(5);
    panic();
  });

  expect(tester).toThrowError();
});

test("Sync defer", (done) => {
  let i = 0;

  using _ = defer(() => {
    expect(i).toBe(1);
    done();
  });

  i += 1;
});

test("Async defer", async (done) => {
  let text = "🥺";

  await using _ = defer(async () => {
    expect(text).toBe("👉👈");
    done();
  });

  text = "👉👈";
});

test("Sync throwing errors", (done) => {
  function tester() {
    using _ = defer(() => {
      done();
    });

    panic();
  }

  catchUnwind(() => {
    tester();
  });

  done("Unreachable");
});

test("Async throwing errors", async (done) => {
  async function tester() {
    await using _ = defer(async () => {
      done();
    });

    panic();
  }

  await catchUnwindAsync(async () => {
    await tester();
  });

  done("Unreachable");
});
