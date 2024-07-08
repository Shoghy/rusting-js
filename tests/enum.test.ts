import { expect, test, describe } from "bun:test";
import { Enum } from "../src/enum";
import { panic } from "../src/panic";

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

  const nothing = ExampleEnum.create("Nothing");
  expect(nothing.get_type()).not.toBe("Str");
});

describe("Testing `Enum` equality", () => {
  test("Two different enum arms should be different", () => {
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

  test("If an arm don't hold a value it should always be equal", () => {
    const nothing1 = ExampleEnum.create("Nothing" as never, "Hello World" as never);
    const nothing2 = ExampleEnum.create("Nothing" as never, 13 as never);
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

/**
 * Trying to imitate `Option` class with `Enum`
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class Option<T> extends Enum({
  some: "unknown",
  none: "void",
}) {
  static Some<T>(value: T) {
    return this.create("some", value) as Option<T>;
  }

  static None<T>() {
    return this.create("none") as Option<T>;
  }

  is_some(): boolean{
    return this.is("some");
  }

  is_none(): boolean{
    return this.is("none");
  }

  if_some(func: (value: T) => unknown) {
    this.if_is("some", (value) => func(value as T));
  }

  if_none(func: () => unknown) {
    this.if_is("none", func);
  }

  unwrap(): T {
    return this.match({
      some: (value) => value as T,
      none: () => panic("Called `unwrap` method on a `None`"),
    });
  }

  take(){
    const copy = this.match({
      some: (value) => Option.Some(value as T),
      none:  () => Option.None(),
    });

    this.change_to("none");

    return copy;
  }
}
