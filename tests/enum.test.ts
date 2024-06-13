import { expect, test, describe } from "bun:test";
import { Enum } from "../src/enum";

const ExampleEnum = Enum({
  Str: "string",
  Str2: "string",
  Number: "number",
  Nothing: "void",
  Err: Error
});

test("`get_type` method should return the created type", () => {
  const str = ExampleEnum.create("Str", "Hola mundo");
  expect(str.get_type()).toBe("Str");

  const nothing = ExampleEnum.create("Nothing", undefined);
  expect(nothing.get_type()).not.toBe("Str");
});

describe("Testing `Enum` equality", () => {
  test("Two different enum arms should be different",  () => {
    const str = ExampleEnum.create("Str", "Lo mismo");
    const str2 = ExampleEnum.create("Str2", "Lo mismo");
    expect(str).not.toEqual(str2);

    const num = ExampleEnum.create("Number", 156);
    expect(num).not.toEqual(str);
  });

  test("Same arm should be different if it holds different values", () => {
    const num1 = ExampleEnum.create("Number", 357);
    const num2 = ExampleEnum.create("Number", 753);
    expect(num1).not.toEqual(num2);
  });

  test("Same arm with same values should be equal", () => {
    const str1 = ExampleEnum.create("Str", "Lo mismo");
    const str2 = ExampleEnum.create("Str", "Lo mismo");
    expect(str1).toEqual(str2);
  });

  test("If an arm don't hold a value it should always be equal",  () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nothing1 = ExampleEnum.create("Nothing", "Hello World" as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nothing2 = ExampleEnum.create("Nothing", 13 as any);
    expect(nothing1).toEqual(nothing2);
  });
});

test("`is` method should return true if the type passed is its created value", () => {
  const err = ExampleEnum.create("Err", new Error());
  expect(err.is("Err")).toBe(true);
  expect(err.is("Nothing")).toBe(false);
});

describe("Testing `if_is` method", () => {
  test("should execute", () => {
    const num = ExampleEnum.create("Number", 41);
    let val = 27;
    num.if_is("Number", (value) => {
      val = value;
    });
    expect(val).toBe(41);
  });

  test("should not execute", () => {
    const str = ExampleEnum.create("Str", "Buenas");
    let val = 27;
    str.if_is("Number", (value) => {
      val = value;
    });
    expect(val).not.toBe("Buenas");
    expect(val).toBe(27);
  });
});