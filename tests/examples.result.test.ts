/**
 * This file is to compile some examples of the method of `Option`.
 * This examples the will be added in the JSDoc as examples of the function.
 * I create this file so the examples can be tested to see if they
 * work or not.
 */

import { expect, test } from "bun:test";
import { Err, Ok } from "../src/result";
import { unreachable } from "../src/panic";

test("is_ok", () => {
  const ok = Ok(1);
  expect(ok.is_ok()).toBeTrue();

  const err = Err(2);
  expect(err.is_ok()).toBeFalse();
});

test("is_err", () => {
  const ok = Ok(1);
  expect(ok.is_err()).toBeFalse();

  const err = Err(2);
  expect(err.is_err()).toBeTrue();
});

test("inspect", () => {
  const ok = Ok("Hola");
  ok.inspect((value) => {
    expect(value).toBe("Hola");
  });

  const err = Err("Mundo");
  err.inspect(() => {
    unreachable();
  });
});

test("inspect_err", () => {
  const ok = Ok(2);
  ok.inspect_err(() => {
    unreachable();
  });

  const err = Err(4);
  err.inspect_err((value) => {
    expect(value).toBe(4);
  });
});

test("and", () => {
  let val1 = Ok<string, number>("Bill Cipher");
  let val2 = Err<number, string>(10);
  expect(val1.and(val2)).toEqual(Err(10));

  val1 = Err(3);
  val2 = Ok("Gideon");
  expect(val1.and(val2)).toEqual(Err(3));

  val1 = Ok("Stan Lee");
  val2 = Ok("Stan Ford");
  expect(val1.and(val2)).toEqual(Ok("Stan Ford"));

  val1 = Err(1);
  val2 = Err(2);
  expect(val1.and(val2)).toEqual(Err(1));
});