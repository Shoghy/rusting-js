/**
 * This file is to compile some examples of the method of `Option`.
 * This examples the will be added in the JSDoc as examples of the function.
 * I create this file so the examples can be tested to see if they
 * work or not.
 */

import { expect, test } from "bun:test";
import { Err, Ok } from "../src/result";
import { unreachable } from "../src/panic";
import { None, Some } from "../src/option";

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

test("and_then", () => {
  const ok = Ok(5);
  const result1 = ok.and_then((value) => {
    return Ok(value * value);
  });
  expect(result1).toEqual(Ok(25));

  const err = Err<number, number>(7);
  const result2 = err.and_then((value) => {
    return Ok(value * value);
  });
  expect(result2).toEqual(Err(7));
});

test("err", () => {
  const ok = Ok("You're cute");
  expect(ok.err()).toEqual(None());

  const err = Err(new Error("EEEERRRROOORRRR"));
  expect(err.err()).toEqual(Some(new Error("EEEERRRROOORRRR")));
});

test("expect", () => {
  const msg = "I am an error message, I am here to tell you what went wrong.";

  const ok = Ok("Minecraft");
  expect(ok.expect(msg)).toBe("Minecraft");

  const err = Err("Also try Terraria");
  expect(() => err.expect(msg)).toThrowError(msg);
});

test("expect_err", () => {
  const msg = "Did I do a good job?";

  const ok = Ok("Terraria");
  expect(() => ok.expect_err(msg)).toThrowError(msg);

  const err = Err("Also try Minecraft");
  expect(err.expect_err(msg)).toBe("Also try Minecraft");
});

test("is_err_and", () => {
  const r_true = () => true;
  const r_false = () => false;

  const ok = Ok("Why are you reading this?");
  expect(ok.is_err_and(r_true)).toBeFalse();
  expect(ok.is_err_and(r_false)).toBeFalse();

  const err = Err(7);
  expect(err.is_err_and(r_true)).toBeTrue();
  expect(err.is_err_and(r_false)).toBeFalse();
  expect(err.is_err_and((val) => val === 7)).toBeTrue();
  expect(err.is_err_and((val) => val === 8)).toBeFalse();
});