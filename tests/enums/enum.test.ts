import { describe, test, expect } from "bun:test";
import { Arm, Class, Enum, type GetEnumKeys } from "../../src/enums/enum.ts";
import { panic, unreachable } from "../../src/panic.ts";

class Unknown extends Enum({
  _classType: Class<Unknown>(),
  String: Arm<string>(),
  Number: Arm<number>(),
  BigInt: Arm<bigint>(),
  Boolean: Arm<boolean>(),
  Symbol: Arm<symbol>(),
  Undefined: Arm<undefined>(),
  Object: Arm<object | null>(),
  Function: Arm<(...args: unknown[]) => unknown>(),
}) {
  static From(value: unknown) {
    switch (typeof value) {
      case "string":
        return Unknown.String(value);
      case "number":
        return Unknown.Number(value);
      case "bigint":
        return Unknown.BigInt(value);
      case "boolean":
        return Unknown.Boolean(value);
      case "symbol":
        return Unknown.Symbol(value);
      case "undefined":
        return Unknown.Undefined(value);
      case "object":
        return Unknown.Object(value);
      case "function":
        return Unknown.Function(value as (...args: unknown[]) => unknown);
    }
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
    const u = Unknown.String("hello");
    expect(u.is("String")).toBe(true);

    const n = Unknown.Number(42);
    expect(n.is("Number")).toBe(true);
  });

  test("Unknown.From creates correct variant", () => {
    expect(Unknown.From("abc").is("String")).toBe(true);
    expect(Unknown.From(123).is("Number")).toBe(true);
    expect(Unknown.From(10n).is("BigInt")).toBe(true);
    expect(Unknown.From(true).is("Boolean")).toBe(true);
    expect(Unknown.From(Symbol()).is("Symbol")).toBe(true);
    expect(Unknown.From(undefined).is("Undefined")).toBe(true);
    expect(Unknown.From({}).is("Object")).toBe(true);
    expect(Unknown.From(() => {}).is("Function")).toBe(true);
  });

  test("match executes correct arm", () => {
    const u = Unknown.String("hello");

    const result = u.match({
      String: (v) => `string:${v}`,
      Number: () => "number",
      BigInt: () => "bigint",
      Boolean: () => "bool",
      Symbol: () => "symbol",
      Undefined: () => "undef",
      Object: () => "obj",
      Function: () => "fn",
    });

    expect(result).toBe("string:hello");
  });

  test("match uses default when arm missing", () => {
    const u = Unknown.Boolean(true);

    const result = u.match(
      {
        String: () => "no",
        Number: () => "no",
      },
      () => "default",
    );

    expect(result).toBe("default");
  });

  test("match throws if no matching arm and no default", () => {
    const u = Unknown.Number(12);

    expect(() =>
      // @ts-expect-error invalid type
      u.match({
        String: () => "no",
        Boolean: () => "no",
      }),
    ).toThrow();
  });

  test("ifIs calls function only on matching type", () => {
    const u = Unknown.Number(99);

    let called = false;

    u.ifIs("Number", (v) => {
      called = true;
      expect(v).toBe(99);
    });

    expect(called).toBe(true);

    u.ifIs("String", () => {
      unreachable();
    });
  });

  test("changeTo changes variant when valid", () => {
    const u = Unknown.String("abc");

    const changed = u.changeTo("Number", 55);
    expect(changed).toBe(true);
    expect(u.is("Number")).toBe(true);

    const changedAgain = u.changeTo("Symbol", Symbol("x"));
    expect(changedAgain).toBe(true);
    expect(u.is("Symbol")).toBe(true);
  });

  test("changeTo returns false for invalid type", () => {
    const u = Unknown.String("abc");

    // @ts-expect-error invalid type
    const result = u.changeTo("NotARealVariant", 123);

    expect(result).toBe(false);
    expect(u.is("String")).toBe(true);
  });

  test("Unknown own methods are still accesibles", () => {
    const u = Unknown.String("Hola");

    const result = u.get("String");
    expect(result).toBe("Hola");
    expect(() => u.get("BigInt")).toThrow();
  });

  test("Unknown.From handles null", () => {
    expect(Unknown.From(null).is("Object")).toBe(true);
  });

  test("changeTo mutates instance", () => {
    const u = Unknown.Number(1);
    const ref = u;
    u.changeTo("Boolean", true);
    expect(ref.is("Boolean")).toBe(true);
  });
});
