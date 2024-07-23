/**
 * This file is to compile some examples of the method of `Option`.
 * This examples the will be added in the JSDoc as examples of the function.
 * I create this file so the examples can be tested to see if they
 * work or not.
 */

import { expect, test } from "bun:test";
import { Err, Ok } from "../src/enums";
import { unreachable } from "../src/panic";
import { None, Some } from "../src/enums";

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

test("is_ok_and", () => {
  const r_true = () => true;
  const r_false = () => false;

  const ok = Ok(1);
  expect(ok.is_ok_and(r_true)).toBeTrue();
  expect(ok.is_ok_and(r_false)).toBeFalse();
  expect(ok.is_ok_and((val) => val === 1)).toBeTrue();
  expect(ok.is_ok_and((val) => val === 2)).toBeFalse();

  const err = Err(2);
  expect(err.is_ok_and(r_true)).toBeFalse();
  expect(err.is_ok_and(r_false)).toBeFalse();
});

test("map", () => {
  const ok = Ok("Hello ");
  const result1 = ok.map((val) => val+"World!");
  expect(result1).toEqual(Ok("Hello World!"));

  const err = Err(new Error("Hey"));
  const result2 = err.map(() => 1);
  expect(result2).toEqual(Err(new Error("Hey")));
});

test("map_err", () => {
  const ok = Ok(99);
  const result1 = ok.map_err(() => 7);
  expect(result1).toEqual(Ok(99));

  const err = Err(8);
  const return2 = err.map_err((val) => val*9);
  expect(return2).toEqual(Err(72));
});

test("map_or", () => {
  const ok = Ok("Nih");
  const result1 = ok.map_or("Python", (val) => `Knights who say ${val}`);
  expect(result1).toBe("Knights who say Nih");

  const err = Err(12);
  const result2 = err.map_or("Default value", () => "Not default value");
  expect(result2).toBe("Default value");
});

test("ok", () => {
  const ok = Ok(32);
  expect(ok.ok()).toEqual(Some(32));

  const err = Err("lmao");
  expect(err.ok()).toEqual(None());
});

test("or", () => {
  let val1 = Ok<number, string>(21);
  let val2 = Err<string, number>("This should be an error message");
  expect(val1.or(val2)).toEqual(Ok(21));

  val1 = Err("Another error message");
  val2 = Ok(44);
  expect(val1.or(val2)).toEqual(Ok(44));

  val1 = Ok(85);
  val2 = Ok(333);
  expect(val1.or(val2)).toEqual(Ok(85));

  val1 = Err("Yet another error message");
  val2 = Err("-Error message enthusiast");
  expect(val1.or(val2)).toEqual(Err("-Error message enthusiast"));
});

test("or_else", () => {
  const ok = Ok("The same value");
  const result1 = ok.or_else(() => Ok("Another value"));
  expect(result1).toEqual(Ok("The same value"));

  const err = Err("Value");
  const result2 = err.or_else((val) => Err(`Another ${val}`));
  expect(result2).toEqual(Err("Another Value"));
});

test("unwrap", () => {
  const ok = Ok(0);
  expect(ok.unwrap()).toBe(0);

  const err = Err(777);
  expect(() => err.unwrap()).toThrowError("Called `unwrap` method on a `Err`");
});

test("unwrap_err", () => {
  const ok = Ok("Never");
  expect(() => ok.unwrap_err()).toThrowError("Called `unwrap_err` method on a `Ok`");

  const err = Err("Gonna");
  expect(err.unwrap_err()).toBe("Gonna");
});

test("unwrap_or", () => {
  const ok = Ok(-37);
  expect(ok.unwrap_or(74)).toBe(-37);

  const err = Err<number[], number[]>([1, 2, 3]);
  expect(err.unwrap_or([4, 5, 6])).toEqual([4, 5, 6]);
});

test("unwrap_or_else", () => {
  const ok = Ok("Returned");
  expect(ok.unwrap_or_else(() =>  "Not Returned")).toBe("Returned");

  const err = Err(5);
  expect(err.unwrap_or_else((val) => val*3)).toBe(15);
});

test("match", () => {
  let value = 0;
  const ok = Ok(7);
  ok.match({
    Ok: (val) => {
      value = val;
    },
    Err: () => unreachable(),
  });
  expect(value).toBe(7);

  value = 0;
  const err = Err(123);
  err.match({
    Ok: () => unreachable(),
    Err: (val) => {
      value = val;
    }
  });
  expect(value).toBe(123);
});

test("if_ok", () => {
  let value = 0;
  const ok = Ok(32);
  ok.if_ok((val) => {
    value = val;
  });
  expect(value).toBe(32);

  const err = Err(64);
  err.if_ok(() => {
    throw new Error("This will not be executed");
  });
});

test("if_err", () => {
  const ok = Ok(57);
  ok.if_err(() => {
    throw new Error("This will not be executed");
  });

  let value = 0;
  const err = Err(39);
  err.if_err((val) => {
    value = val;
  });
  expect(value).toBe(39);
});