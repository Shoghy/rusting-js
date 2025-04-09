import { expect, test } from "bun:test";
import { defer } from "../src/utils";
import { catch_unwind, catch_unwind_async, panic } from "../src/panic";

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

  catch_unwind(() => {
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

  await catch_unwind_async(async () => {
    await tester();
  });

  done("Unreachable");
});
