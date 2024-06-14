import { expect, test } from "bun:test";
import { None, Some } from "../src/option";
import { Err, Ok } from "../src/result";

test("map", () => {
  const none = None<string>();
  const result1 = none.map((value) => {
    return value.length;
  });
  expect(result1).toEqual(None());

  const some = Some("1234");
  const result2 = some.map((value) => {
    return value.length;
  });
  expect(result2).toEqual(Some(4));
});

test("map_or", () => {
  const none = None();
  const result1 = none.map_or("Hola", () => {
    return "Hello";
  });
  expect(result1).toBe("Hola");

  const some = Some(356);
  const result2 = some.map_or("NotAHexNumber", (value) => {
    return value.toString(16);
  });
  expect(result2).toBe("164");
});

test("map_or_else", () => {
  const none = None();
  const result1 = none.map_or_else({
    some: () => {
      return "It is Some";
    },
    none: () => {
      return "It is None";
    },
  });
  expect(result1).toBe("It is None");

  const some = Some(17);
  const result2 = some.map_or_else({
    some: (value) => {
      return value.toString();
    },
    none: () => {
      return "It is None";
    },
  });
  expect(result2).toBe("17");
});

test("ok_or", () => {
  const none = None();
  const result1 = none.ok_or("The value was a None");
  expect(result1).toEqual(Err("The value was a None"));

  const some = Some(9);
  const result2 = some.ok_or("The value was a None");
  expect(result2).toEqual(Ok(9));
});

test("ok_or_else", () => {
  const none = None();
  const result1 = none.ok_or_else(() => 68);
  expect(result1).toEqual(Err(68));

  const some = Some("DCLXVI");
  const result2 = some.ok_or_else(() => "DCXVI");
  expect(result2).toEqual(Ok("DCLXVI"));
});

test("unwrap_unchecked", () => {
  const none = None();
  const result1 = none.unwrap_unchecked();
  expect(result1).toBe(undefined);

  const some = Some("Some");
  const result2 = some.unwrap_unchecked();
  expect(result2).toBe("Some");
});

test("if_some", () => {
  let value = 0;
  const none = None();
  none.if_some(() => {
    value = 1;
  });
  expect(value).toBe(0);

  value = 0;
  const some = Some(1);
  some.if_some((v) => {
    value = v;
  });
  expect(value).toBe(1);
});

test("if_none", () => {
  let value = 0;
  const none = None();
  none.if_none(() => {
    value = 1;
  });
  expect(value).toBe(1);

  value = 0;
  const some = Some(1);
  some.if_none(() => {
    value = 1;
  });
  expect(value).toBe(0);
});

test("match", () => {
  let value = 0;
  const none = None<number>();
  none.match({
    some: (v) => {
      value = v;
    },
    none: () => {
      value = 2;
    },
  });
  expect(value).toBe(2);

  value = 0;
  const some = Some(1);
  some.match({
    some: (v) => {
      value = v;
    },
    none: () => {
      value = 2;
    },
  });
  expect(value).toBe(1);
});