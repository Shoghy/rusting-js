import { test, describe, expect } from "bun:test";
import { string_to_utf8 } from "../../src/strings/utils";

describe("should convert string into utf-8", () => {
  test("ASCII characters", () => {
    const utf8_arr = string_to_utf8("Hello");
    expect(utf8_arr).toEqual([72, 101, 108, 108, 111]);
  });

  test("Japanese texts", () => {
    const arr1 = string_to_utf8("おはよう");
    expect(arr1).toEqual([
      227, 129, 138, 227, 129, 175, 227, 130, 136, 227, 129, 134,
    ]);

    const arr2 = string_to_utf8("お元気ですか");
    expect(arr2).toEqual([
      227, 129, 138, 229, 133, 131, 230, 176, 151, 227, 129, 167, 227, 129, 153,
      227, 129, 139,
    ]);
  });

  test("Emojis", () => {
    const utf8_arr = string_to_utf8("🥺👉👈");
    expect(utf8_arr).toEqual([
      240, 159, 165, 186, 240, 159, 145, 137, 240, 159, 145, 136,
    ]);
  });

  test("ñ", () => {
    const utf8_arr = string_to_utf8("ñ");
    expect(utf8_arr).toEqual([195, 177]);
  });

  test("Loss", () => {
    const arr1 = string_to_utf8(`
𓀥       𓁆 𓀕
𓁆 𓀟     𓀣 𓁀
`);
    expect(arr1).toEqual([
      10, 240, 147, 128, 165, 32, 32, 32, 32, 32, 32, 32, 240, 147, 129, 134,
      32, 240, 147, 128, 149, 10, 240, 147, 129, 134, 32, 240, 147, 128, 159,
      32, 32, 32, 32, 32, 240, 147, 128, 163, 32, 240, 147, 129, 128, 10,
    ]);

    const arr2 = string_to_utf8(`
| ||

|| |--
`);
    expect(arr2).toEqual([
      10, 124, 32, 124, 124, 10, 10, 124, 124, 32, 124, 45, 45, 10,
    ]);
  });
});
