/**
 * This file is to compile some examples of the method of `Option`.
 * This examples the will be added in the JSDoc as examples of the function.
 * I create this file so the examples can be tested to see if they
 * work or not.
 */

import { expect, test } from "bun:test";
import { None, Some } from "../../src/enums";
import { unreachable } from "../../src/panic";

test("isSome", () => {
  const some = Some(0);
  expect(some.isSome()).toBe(true);

  const none = None();
  expect(none.isSome()).toBe(false);
});

test("isNone", () => {
  const some = Some(0);
  expect(some.isNone()).toBe(false);

  const none = None();
  expect(none.isNone()).toBe(true);
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
  expect(val1.or(val2).unwrap()).toBe("lorem");

  val1 = None();
  val2 = Some("6.02214076 * 10^23");
  expect(val1.or(val2).unwrap()).toBe("6.02214076 * 10^23");

  val1 = Some("あなた");
  val2 = Some("かわいい");
  expect(val1.or(val2).unwrap()).toBe("あなた");

  val1 = None();
  val2 = None();
  expect(val1.or(val2).isNone()).toBeTrue();
});

test("orElse", () => {
  const none = None<number[]>();
  const result1 = none.orElse(() => {
    return Some([4, 20]);
  });
  expect(result1.unwrap()).toEqual([4, 20]);

  const some = Some(69);
  const result2 = some.orElse(() => {
    return Some(13);
  });
  expect(result2.unwrap()).toBe(69);
});

test("xor", () => {
  let val1 = Some(1);
  let val2 = None<number>();
  expect(val1.xor(val2).unwrap()).toBe(1);

  val1 = None();
  val2 = Some(2);
  expect(val1.xor(val2).unwrap()).toBe(2);

  val1 = Some(3);
  val2 = Some(4);
  expect(val1.xor(val2).isNone()).toBeTrue();

  val1 = None();
  val2 = None();
  expect(val1.xor(val2).isNone()).toBeTrue();
});

test("and", () => {
  let val1 = Some("Español");
  let val2 = None<string>();
  expect(val1.and(val2).isNone()).toBeTrue();

  val1 = None();
  val2 = Some("Português");
  expect(val1.and(val2).isNone()).toBeTrue();

  val1 = Some("English");
  val2 = Some("日本語");
  expect(val1.and(val2).unwrap()).toBe("日本語");

  val1 = None();
  val2 = None();
  expect(val1.and(val2).isNone()).toBeTrue();
});

test("andThen", () => {
  const none = None<number>();
  const result1 = none.andThen((value) => {
    return Some(value * value);
  });
  expect(result1.isNone()).toBeTrue();

  const some = Some(5);
  const result = some.andThen((value) => {
    return Some(value * value);
  });
  expect(result.unwrap()).toBe(25);
});

test("expect", () => {
  const none = None();
  const msg = "This should panic";
  expect(() => none.expect(msg)).toThrowError(msg);

  const some = Some(1);
  const val = some.expect("This should not panic");
  expect(val).toBe(1);
});

test("getOrInsert", () => {
  const option1 = None<number>();
  const result1 = option1.getOrInsert(3.1415);
  expect(result1).toBe(3.1415);
  expect(option1.unwrap()).toBe(3.1415);

  const option2 = Some(42);
  const result2 = option2.getOrInsert(19);
  expect(result2).toBe(42);
  expect(option2.unwrap()).toEqual(42);
});

test("getOrInsertWith", () => {
  const text1 = "Hello World!";
  const option1 = None<string>();
  const result1 = option1.getOrInsertWith(() => text1);
  expect(result1).toBe(text1);
  expect(option1.unwrap()).toBe(text1);

  const text2 = "Cards Against Humanity";
  const option2 = Some(text2);
  const result2 = option2.getOrInsertWith(() => "^w^");
  expect(result2).toBe(text2);
  expect(option2.unwrap()).toBe(text2);
});

test("isSomeAnd", () => {
  const rTrue = () => true;
  const rFalse = () => false;

  const none = None();
  expect(none.isSomeAnd(rTrue)).toBe(false);
  expect(none.isSomeAnd(rFalse)).toBe(false);

  const some = Some(1);
  expect(some.isSomeAnd(rTrue)).toBe(true);
  expect(some.isSomeAnd(rFalse)).toBe(false);
  expect(some.isSomeAnd((value) => value == 1)).toBe(true);
  expect(some.isSomeAnd((value) => value == 2)).toBe(false);
});

test("take", () => {
  let option1 = Some(142857);
  let option2 = option1.take();

  expect(option1.isNone()).toBeTrue();
  expect(option2.unwrap()).toBe(142857);

  option1 = None();
  option2 = option1.take();
  expect(option1.isNone()).toBeTrue();
  expect(option2.isNone()).toBeTrue();
});

test("unwrap", () => {
  const none = None();
  expect(() => none.unwrap()).toThrow();

  const some = Some(1);
  const val = some.unwrap();
  expect(val).toBe(1);
});

test("unwrapOr", () => {
  const none = None<string>();
  const result1 = none.unwrapOr("31 minutos");
  expect(result1).toBe("31 minutos");

  const some = Some("Mr. Trance");
  const result2 = some.unwrapOr("Esteman");
  expect(result2).toBe("Mr. Trance");
});

test("unwrapOrElse", () => {
  const none = None<number>();
  const result1 = none.unwrapOrElse(() => 0xe0218a);
  expect(result1).toBe(0xe0218a);

  const some = Some(0);
  const result2 = some.unwrapOrElse(() => 1);
  expect(result2).toBe(0);
});

test("zip", () => {
  let val1 = Some(1);
  let val2 = None<string>();
  expect(val1.zip(val2).isNone()).toBeTrue();

  val1 = None();
  val2 = Some("thing");
  expect(val1.zip(val2).isNone()).toBeTrue();

  val1 = Some(0 + 0 + 7);
  val2 = Some("Agente");
  expect(val1.zip(val2).unwrap()).toEqual([7, "Agente"]);

  val1 = None();
  val2 = None();
  expect(val1.zip(val2).isNone()).toBeTrue();
});

test("map", () => {
  const none = None<string>();
  const result1 = none.map((value) => {
    return value.length;
  });
  expect(result1.isNone()).toBeTrue();

  const some = Some("1234");
  const result2 = some.map((value) => {
    return value.length;
  });
  expect(result2.unwrap()).toBe(4);
});

test("mapOr", () => {
  const none = None();
  const result1 = none.mapOr("Hola", () => {
    return "Hello";
  });
  expect(result1).toBe("Hola");

  const some = Some(356);
  const result2 = some.mapOr("NotAHexNumber", (value) => {
    return value.toString(16);
  });
  expect(result2).toBe("164");
});

test("okOr", () => {
  const text = "The value was a None";
  const none = None();
  const result1 = none.okOr(text);
  expect(result1.unwrapErr()).toBe(text);

  const some = Some(9);
  const result2 = some.okOr(text);
  expect(result2.unwrap()).toBe(9);
});

test("okOrElse", () => {
  const none = None();
  const result1 = none.okOrElse(() => 68);
  expect(result1.unwrapErr()).toBe(68);

  const some = Some("DCLXVI");
  const result2 = some.okOrElse(() => "DCXVI");
  expect(result2.unwrap()).toBe("DCLXVI");
});

test("unwrapUnchecked", () => {
  const none = None();
  const result1 = none.unwrapUnchecked();
  expect(result1).toBe(undefined);

  const some = Some("Some");
  const result2 = some.unwrapUnchecked();
  expect(result2).toBe("Some");
});

test("ifSome", () => {
  let value = 0;
  const none = None();
  none.ifSome(() => unreachable());
  expect(value).toBe(0);

  value = 0;
  const some = Some(1);
  some.ifSome((v) => {
    value = v;
  });
  expect(value).toBe(1);
});

test("ifNone", () => {
  let value = 0;
  const none = None();
  none.ifNone(() => {
    value = 1;
  });
  expect(value).toBe(1);

  value = 0;
  const some = Some(1);
  some.ifNone(() => unreachable());
  expect(value).toBe(0);
});

test("match", () => {
  let value = 0;
  const none = None<number>();
  none.match({
    Some: () => unreachable(),
    None: () => {
      value = 2;
    },
  });
  expect(value).toBe(2);

  value = 0;
  const some = Some(1);
  some.match({
    Some: (v) => {
      value = v;
    },
    None: () => unreachable(),
  });
  expect(value).toBe(1);
});

test("mapOrElse", () => {
  const none = None();
  const result1 = none.mapOrElse(
    () => {
      return "It is None";
    },
    () => {
      return "It is Some";
    },
  );
  expect(result1).toBe("It is None");

  const some = Some(17);
  const result2 = some.mapOrElse(
    () => {
      return "It is None";
    },
    (value) => {
      return value.toString();
    },
  );
  expect(result2).toBe("17");
});
