import { expect, test } from "bun:test";
import { defer } from "../src/utils.ts";
import { catchUnwind, catchUnwindAsync, panic } from "../src/panic.ts";

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
