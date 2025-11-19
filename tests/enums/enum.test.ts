import { describe, test, expect } from "bun:test";
import { Arm, Class, Enum, type GetEnumKeys } from "../../src/enums/enum.ts";
import { panic, unreachable } from "../../src/panic.ts";

class Unknown extends Enum({
  _classType: Class<Unknown>(),
  string: Arm<string>(),
  number: Arm<number>(),
  bigint: Arm<bigint>(),
  boolean: Arm<boolean>(),
  symbol: Arm<symbol>(),
  undefined: Arm<undefined>(),
  object: Arm<object | null>(),
  function: Arm<(...args: unknown[]) => unknown>(),
}) {
  static From(value: unknown): Unknown {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return Unknown[typeof value](value);
  }

  override isValidTypeValue(
    type:
      | "string"
      | "number"
      | "bigint"
      | "boolean"
      | "symbol"
      | "undefined"
      | "object"
      | "function",
    value:
      | string
      | number
      | bigint
      | boolean
      | symbol
      | object
      | ((...args: unknown[]) => unknown)
      | null
      | undefined,
  ): boolean {
    return typeof value === type;
  }

  get<T extends keyof GetEnumKeys<Unknown>>(type: T): GetEnumKeys<Unknown>[T] {
    if (!this.is(type)) {
      panic();
    }

    return this.match(
      {
        [type]: (value: GetEnumKeys<Unknown>[T]) => value,
      },
      () => unreachable(),
    );
  }
}

describe("Unknown Enum", () => {
  test("creates correct variant from constructors", () => {
    const u = Unknown.string("hello");
    expect(u.is("string")).toBe(true);

    const n = Unknown.number(42);
    expect(n.is("number")).toBe(true);
  });

  test("Unknown.From creates correct variant", () => {
    expect(Unknown.From("abc").is("string")).toBe(true);
    expect(Unknown.From(123).is("number")).toBe(true);
    expect(Unknown.From(10n).is("bigint")).toBe(true);
    expect(Unknown.From(true).is("boolean")).toBe(true);
    expect(Unknown.From(Symbol()).is("symbol")).toBe(true);
    expect(Unknown.From(undefined).is("undefined")).toBe(true);
    expect(Unknown.From({}).is("object")).toBe(true);
    expect(Unknown.From(() => {}).is("function")).toBe(true);
  });

  test("match executes correct arm", () => {
    const u = Unknown.string("hello");

    const result = u.match({
      string: (v) => `string:${v}`,
      number: () => "number",
      bigint: () => "bigint",
      boolean: () => "bool",
      symbol: () => "symbol",
      undefined: () => "undef",
      object: () => "obj",
      function: () => "fn",
    });

    expect(result).toBe("string:hello");
  });

  test("match uses default when arm missing", () => {
    const u = Unknown.boolean(true);

    const result = u.match(
      {
        string: () => "no",
        number: () => "no",
      },
      () => "default",
    );

    expect(result).toBe("default");
  });

  test("match throws if no matching arm and no default", () => {
    const u = Unknown.number(12);

    expect(() =>
      // @ts-expect-error invalid type
      u.match({
        string: () => "no",
        boolean: () => "no",
      }),
    ).toThrow();
  });

  test("ifIs calls function only on matching type", () => {
    const u = Unknown.number(99);

    let called = false;

    u.ifIs("number", (v) => {
      called = true;
      expect(v).toBe(99);
    });

    expect(called).toBe(true);

    u.ifIs("string", () => {
      unreachable();
    });
  });

  test("changeTo changes variant when valid", () => {
    const u = Unknown.string("abc");

    const changed = u.changeTo("number", 55);
    expect(changed).toBe(true);
    expect(u.is("number")).toBe(true);

    const changedAgain = u.changeTo("symbol", Symbol("x"));
    expect(changedAgain).toBe(true);
    expect(u.is("symbol")).toBe(true);
  });

  test("changeTo returns false for invalid type", () => {
    const u = Unknown.string("abc");

    // @ts-expect-error invalid type
    const result = u.changeTo("NotARealVariant", 123);

    expect(result).toBe(false);
    expect(u.is("string")).toBe(true);
  });

  test("Unknown own methods are still accesibles", () => {
    const u = Unknown.string("Hola");

    const result = u.get("string");
    expect(result).toBe("Hola");
    expect(() => u.get("bigint")).toThrow();
  });

  test("Unknown.From handles null", () => {
    expect(Unknown.From(null).is("object")).toBe(true);
  });

  test("changeTo mutates instance", () => {
    const u = Unknown.number(1);
    const ref = u;
    u.changeTo("boolean", true);
    expect(ref.is("boolean")).toBe(true);
  });

  test("Type and arm mismatch", () => {
    // @ts-expect-error invalid type
    expect(() => Unknown.string(1)).toThrow();
  });
});
