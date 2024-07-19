/**
 * This file is to compile some examples of the method of `Option`.
 * This examples the will be added in the JSDoc as examples of the function.
 * I create this file so the examples can be tested to see if they
 * work or not.
 */

import { expect, test } from "bun:test";
import { None, Some } from "../src/option";
import { Err, Ok } from "../src/result";
import { unreachable } from "../src/panic";

test("is_some", () => {
  const some = Some(0);
  expect(some.is_some()).toBe(true);

  const none = None();
  expect(none.is_some()).toBe(false);
});

test("is_none", () => {
  const some = Some(0);
  expect(some.is_none()).toBe(false);

  const none = None();
  expect(none.is_none()).toBe(true);
});

test("inspect", () => {
  const some = Some([1, 2, 3, 4]);
  some.inspect((value) => {
    expect(value).toEqual([1, 2, 3, 4]);
  });

  const none = None<number[]>();
  none.inspect(() => {
    unreachable();
  });
});

test("or", () => {
  let val1 = Some("lorem");
  let val2 = None<string>();
  expect(val1.or(val2)).toEqual(Some("lorem"));

  val1 = None();
  val2 = Some("6.02214076 * 10^23");
  expect(val1.or(val2)).toEqual(Some("6.02214076 * 10^23"));

  val1 = Some("あなた");
  val2 = Some("かわいい");
  expect(val1.or(val2)).toEqual(Some("あなた"));

  val1 = None();
  val2 = None();
  expect(val1.or(val2)).toEqual(None());
});

test("or_else", () => {
  const none = None<number[]>();
  const result1 = none.or_else(() => {
    return Some([4, 20]);
  });
  expect(result1).toEqual(Some([4, 20]));

  const some = Some(69);
  const result2 = some.or_else(() => {
    return Some(13);
  });
  expect(result2).toEqual(Some(69));
});

test("xor", () => {
  let val1 = Some(1);
  let val2 = None<number>();
  expect(val1.xor(val2)).toEqual(Some(1));

  val1 = None();
  val2 = Some(2);
  expect(val1.xor(val2)).toEqual(Some(2));

  val1 = Some(3);
  val2 = Some(4);
  expect(val1.xor(val2)).toEqual(None());

  val1 = None();
  val2 = None();
  expect(val1.xor(val2)).toEqual(None());
});

test("and", () => {
  let val1 = Some("Español");
  let val2 = None<string>();
  expect(val1.and(val2)).toEqual(None());

  val1 = None();
  val2 = Some("Português");
  expect(val1.and(val2)).toEqual(None());

  val1 = Some("English");
  val2 = Some("日本語");
  expect(val1.and(val2)).toEqual(Some("日本語"));

  val1 = None();
  val2 = None();
  expect(val1.and(val2)).toEqual(None());
});

test("and_then", () => {
  const none = None<number>();
  const result1 = none.and_then((value) => {
    return Some(value * value);
  });
  expect(result1).toEqual(None());

  const some = Some(5);
  const result = some.and_then((value) => {
    return Some(value * value);
  });
  expect(result).toEqual(Some(25));
});

test("expect", () => {
  const none = None();
  const msg = "This should throw an exception";
  expect(() => none.expect(msg)).toThrowError(msg);

  const some = Some(1);
  const val = some.expect("This should not panic");
  expect(val).toBe(1);
});

test("get_or_insert", () => {
  const option1 = None<number>();
  const result1 = option1.get_or_insert(3.1415);
  expect(result1).toBe(3.1415);
  expect(option1).toEqual(Some(3.1415));

  const option2 = Some(42);
  const result2 = option2.get_or_insert(19);
  expect(result2).toBe(42);
  expect(option2).toEqual(Some(42));
});

test("get_or_insert_with", () => {
  const option1 = None<string>();
  const result1 = option1.get_or_insert_with(
    () => "Hello World!"
  );
  expect(result1).toEqual("Hello World!");
  expect(option1).toEqual(Some("Hello World!"));

  const option2 = Some("Cards Against Humanity");
  const result2 = option2.get_or_insert_with(
    () => "Humanity"
  );
  expect(result2).toEqual("Cards Against Humanity");
  expect(option2).toEqual(Some("Cards Against Humanity"));
});

test("is_some_and", () => {
  const r_true = () => true;
  const r_false = () => false;

  const none = None();
  expect(none.is_some_and(r_true)).toBe(false);
  expect(none.is_some_and(r_false)).toBe(false);

  const some = Some(1);
  expect(some.is_some_and(r_true)).toBe(true);
  expect(some.is_some_and(r_false)).toBe(false);
  expect(some.is_some_and((value) => value == 1)).toBe(true);
  expect(some.is_some_and((value) => value == 2)).toBe(false);
});

test("take", () => {
  let option1 = Some(142857);
  let option2 = option1.take();

  expect(option1).toEqual(None());
  expect(option2).toEqual(Some(142857));

  option1 = None();
  option2 = option1.take();
  expect(option1).toEqual(None());
  expect(option2).toEqual(None());
});

test("unwrap", () => {
  const none = None();
  expect(() => none.unwrap()).toThrow();

  const some = Some(1);
  const val = some.unwrap();
  expect(val).toBe(1);
});

test("unwrap_or", () => {
  const none = None<string>();
  const result1 = none.unwrap_or("31 minutos");
  expect(result1).toBe("31 minutos");

  const some = Some("Mr. Trance");
  const result2 = some.unwrap_or("Esteman");
  expect(result2).toBe("Mr. Trance");
});

test("unwrap_or_else", () => {
  const none = None<number>();
  const result1 = none.unwrap_or_else(() => 0xe0218a);
  expect(result1).toBe(0xe0218a);

  const some = Some(0);
  const result2 = some.unwrap_or_else(() => 1);
  expect(result2).toBe(0);
});

test("zip", () => {
  let val1 = Some(1);
  let val2 = None<string>();
  expect(val1.zip(val2)).toEqual(None());

  val1 = None();
  val2 = Some("thing");
  expect(val1.zip(val2)).toEqual(None());

  val1 = Some(0 + 0 + 7);
  val2 = Some("Agente");
  expect(val1.zip(val2)).toEqual(Some([7, "Agente"]));

  val1 = None();
  val2 = None();
  expect(val1.zip(val2)).toEqual(None());
});

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
