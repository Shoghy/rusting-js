/**
 * This file is to compile some examples of the method of `Option`.
 * This examples the will be added in the JSDoc as examples of the function.
 * I create this file so the examples can be tested to see if they
 * work or not.
 */

import { expect, test } from "bun:test";
import { Err, Ok } from "../../src/enums";
import { catchUnwind, unreachable } from "../../src/panic";
import { None, Some } from "../../src/enums";

test("isOk", () => {
  const ok = Ok(1);
  expect(ok.isOk()).toBeTrue();

  const err = Err(2);
  expect(err.isOk()).toBeFalse();
});

test("isErr", () => {
  const ok = Ok(1);
  expect(ok.isErr()).toBeFalse();

  const err = Err(2);
  expect(err.isErr()).toBeTrue();
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

test("inspectErr", () => {
  const ok = Ok(2);
  ok.inspectErr(() => {
    unreachable();
  });

  const err = Err(4);
  err.inspectErr((value) => {
    expect(value).toBe(4);
  });
});

test("and", () => {
  let val1 = Ok<string, number>("Bill Cipher");
  let val2 = Err<string, number>(10);
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

test("andThen", () => {
  const ok = Ok(5);
  const result1 = ok.andThen((value) => {
    return Ok(value * value);
  });
  expect(result1).toEqual(Ok(25));

  const err = Err<number, number>(7);
  const result2 = err.andThen((value) => {
    return Ok(value * value);
  });
  expect(result2).toEqual(Err(7));
});

test("err", () => {
  const ok = Ok("You're cute");
  expect(ok.err()).toEqual(None());

  const err = Err(new Error("EEEEEERRRRROOOOORRR"));
  expect(err.err()).toEqual(Some(new Error("EEEEEERRRRROOOOORRR")));
});

test("expect", () => {
  const msg = "I am an error message, I am here to tell you what went wrong.";

  const ok = Ok("Minecraft");
  expect(ok.expect(msg)).toBe("Minecraft");

  const err = Err("Also try Terraria");
  expect(() => err.expect(msg)).toThrowError(msg);
});

test("expectErr", () => {
  const msg = "Did I do a good job?";

  const ok = Ok("Terraria");
  expect(() => ok.expectErr(msg)).toThrowError(msg);

  const err = Err("Also try Minecraft");
  expect(err.expectErr(msg)).toBe("Also try Minecraft");
});

test("isErrAnd", () => {
  const rTrue = () => true;
  const rFalse = () => false;

  const ok = Ok("Why are you reading this?");
  expect(ok.isErrAnd(rTrue)).toBeFalse();
  expect(ok.isErrAnd(rFalse)).toBeFalse();

  const err = Err(7);
  expect(err.isErrAnd(rTrue)).toBeTrue();
  expect(err.isErrAnd(rFalse)).toBeFalse();
  expect(err.isErrAnd((val) => val === 7)).toBeTrue();
  expect(err.isErrAnd((val) => val === 8)).toBeFalse();
});

test("isOkAnd", () => {
  const rTrue = () => true;
  const rFalse = () => false;

  const ok = Ok(1);
  expect(ok.isOkAnd(rTrue)).toBeTrue();
  expect(ok.isOkAnd(rFalse)).toBeFalse();
  expect(ok.isOkAnd((val) => val === 1)).toBeTrue();
  expect(ok.isOkAnd((val) => val === 2)).toBeFalse();

  const err = Err(2);
  expect(err.isOkAnd(rTrue)).toBeFalse();
  expect(err.isOkAnd(rFalse)).toBeFalse();
});

test("map", () => {
  const ok = Ok("Hello ");
  const result1 = ok.map((val) => val + "World!");
  expect(result1).toEqual(Ok("Hello World!"));

  const err = Err(new Error("Hey"));
  const result2 = err.map(() => 1);
  expect(result2).toEqual(Err(new Error("Hey")));
});

test("mapErr", () => {
  const ok = Ok(99);
  const result1 = ok.mapErr(() => 7);
  expect(result1).toEqual(Ok(99));

  const err = Err(8);
  const return2 = err.mapErr((val) => val * 9);
  expect(return2).toEqual(Err(72));
});

test("mapOr", () => {
  const ok = Ok("Nih");
  const result1 = ok.mapOr("Python", (val) => `Knights who say ${val}`);
  expect(result1).toBe("Knights who say Nih");

  const err = Err(12);
  const result2 = err.mapOr("Default value", () => "Not default value");
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
  let val2 = Err<number, string>("This should be an error message");
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

test("orElse", () => {
  const ok = Ok("The same value");
  const result1 = ok.orElse(() => Ok("Another value"));
  expect(result1).toEqual(Ok("The same value"));

  const err = Err("Value");
  const result2 = err.orElse((val) => Err(`Another ${val}`));
  expect(result2).toEqual(Err("Another Value"));
});

test("unwrap", () => {
  const ok = Ok(0);
  expect(ok.unwrap()).toBe(0);

  const err = Err(777);
  expect(() => err.unwrap()).toThrowError("Called `unwrap` method on a `Err`");
});

test("unwrapErr", () => {
  const ok = Ok("Never");
  expect(() => ok.unwrapErr()).toThrowError(
    "Called `unwrapErr` method on a `Ok`",
  );

  const err = Err("Gonna");
  expect(err.unwrapErr()).toBe("Gonna");
});

test("unwrapOr", () => {
  const ok = Ok(-37);
  expect(ok.unwrapOr(74)).toBe(-37);

  const err = Err<number[], number[]>([1, 2, 3]);
  expect(err.unwrapOr([4, 5, 6])).toEqual([4, 5, 6]);
});

test("unwrapOrElse", () => {
  const ok = Ok("Returned");
  expect(ok.unwrapOrElse(() => "Not Returned")).toBe("Returned");

  const err = Err(5);
  expect(err.unwrapOrElse((val) => val * 3)).toBe(15);
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
    },
  });
  expect(value).toBe(123);
});

test("ifOk", () => {
  let value = 0;
  const ok = Ok(32);
  ok.ifOk((val) => {
    value = val;
  });
  expect(value).toBe(32);

  const err = Err(64);
  err.ifOk(() => {
    throw new Error("This will not be executed");
  });
});

test("ifErr", () => {
  const ok = Ok(57);
  ok.ifErr(() => {
    throw new Error("This will not be executed");
  });

  let value = 0;
  const err = Err(39);
  err.ifErr((val) => {
    value = val;
  });
  expect(value).toBe(39);
});

test("mapOrElse", () => {
  const ok = Ok("egg_irl");
  const result1 = ok.mapOrElse(
    () => unreachable(),
    (val) => `r/${val}`,
  );
  expect(result1).toBe("r/egg_irl");

  const err = Err("Celeste");
  const result2 = err.mapOrElse(
    (val) => `${val}: Madeline`,
    () => unreachable(),
  );
  expect(result2).toBe("Celeste: Madeline");
});

test("throw", (done) => {
  const ok = Ok<string, Error>("Will not throw");
  const result1 = catchUnwind(() => {
    const val = ok.throw();
    expect(val).toBe("Will not throw");
    return val;
  });
  expect(result1).toEqual(ok);

  const err = Err<string, Error>(new Error("Will throw"));
  const result2 = catchUnwind(() => {
    const val = err.throw();
    done("This will never execute");
    return val;
  });
  expect(result2).toEqual(err);
  done();
});
