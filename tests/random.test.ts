import { expect, test, describe } from "bun:test";
import { randomInt, randomString } from "./random.ts";

describe("Testing `randomInt` with fixed values", () => {
  test("The returned value should be between it min and max including both", () => {
    for (let i = 0; i < 1000; ++i) {
      expect(randomInt(1, 10)).toBeWithin(1, 11);
    }
  });

  test("This should not collide", () => {
    for (let i = 0; i < 1000; ++i) {
      expect(randomInt(1, 10)).not.toBe(randomInt(11, 20));
    }
  });
});

/**
 * There is a very small possibility for this test to fail,
 * but I believe I will not be alive when that happens
 */
test(
  "Testing `randomString` function",
  () => {
    const str1 = randomString(11);
    const str2 = randomString(11);
    expect(str1).not.toBe(str2);
  },
  { retry: 5 },
);
