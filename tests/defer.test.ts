import { expect, test } from "bun:test";
import { defer } from "../src/utils";
import { panic } from "../src/panic";

test("Sync defer", () => {
  let i = 0;

  using _ = defer(() => {
    expect(i).toBe(1);
  });

  i += 1;
});

test("Async defer", async () => {
  let text = "🥺";

  await using _ = defer(async () => {
    expect(text).toBe("👉👈");
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

  try {
    tester();
  } catch (e) {
    return;
  }
});

test("Async throwing errors", async (done) => {
  async function tester() {
    await using _ = defer(async () => {
      done();
    });

    panic();
  }

  try {
    await tester();
  } catch (e) {
    return;
  }
});
