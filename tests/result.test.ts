import { expect, test, describe } from "bun:test";
import { Err, Ok, Result } from "../src/result";
import { unreachable } from "../src/panic_functions";
import { None, Some } from "../src/option";

describe("Testing `Ok` and `Err` equality", () => {
  test("`Ok` and `Err` should never be equal", () => {
    let ok: Result<unknown, unknown> = Ok(1);
    let err: Result<unknown, unknown> = Err(1);
    expect(ok).not.toEqual(err);

    ok = Ok("1");
    err = Err(1);
    expect(ok).not.toEqual(err);

    ok = Ok(1);
    err = Ok(2);
    expect(ok).not.toEqual(err);
  });

  test("`Ok` should be equal to `Ok` if they hold the same value", () => {
    let ok1 = Ok(1);
    let ok2 = Ok(2);
    expect(ok1).not.toEqual(ok2);

    ok1 = Ok(3);
    ok2 = Ok(3);
    expect(ok1).toEqual(ok2);
  });

  test("`Err` should be equal to `Err` if they hold the same value", () => {
    let err1 = Err(1);
    let err2 = Err(2);
    expect(err1).not.toEqual(err2);

    err1 = Err(3);
    err2 = Err(3);
    expect(err1).toEqual(err2);
  });
});

describe("Testing `is_ok` method", () => {
  test("`Ok` should return true", () => {
    const ok = Ok(1);
    expect(ok.is_ok()).toBeTrue();
  });

  test("`Err` should return false", () => {
    const err = Err(1);
    expect(err.is_ok()).toBeFalse();
  });
});

describe("Testing `is_err` method", () => {
  test("`Ok` should return false", () => {
    const ok = Ok(1);
    expect(ok.is_err()).toBeFalse();
  });

  test("`Err` should return true", () => {
    const err = Err(1);
    expect(err.is_err()).toBeTrue();
  });
});

describe("Testing `inspect` method", () => {
  test("`Ok` should run the `func` parameter", () => {
    let arr = [4, 5, 6];
    const ok = Ok([1, 2, 3]);
    ok.inspect((value) => {
      arr = value;
    });

    expect(arr).toEqual([1, 2, 3]);
  });

  test("`Err` should not run the `func` parameter", (done) => {
    const err = Err(5);

    err.inspect(() => {
      done("`inspect` was executed");
    });

    done();
  });

  test("`Ok` and `Err` should return themselves", () => {
    const ok = Ok("Original");
    const err = Err("Doppelganger");

    expect(ok.inspect(() => {})).toBe(ok);
    expect(err.inspect(() => {})).toBe(err);
  });
});

describe("Testing `inspect_err` method", () => {
  test("`Ok` should not run the `func` parameter", (done) => {
    const ok = Ok([1, 2, 3]);
    ok.inspect_err(() => {
      done("`inspect_err` was executed");
    });

    done();
  });

  test("`Err` should run the `func` parameter", () => {
    let val = "System is working";
    const err = Err("System is not working");
    err.inspect_err((value) => {
      val = value;
    });

    expect(val).toEqual("System is not working");
  });

  test("`Ok` and `Err` should return themselves", () => {
    const ok = Ok("C#"); //Microsoft flavored JAVA
    const err = Err("JAVA");

    expect(ok.inspect_err(() => {})).toBe(ok);
    expect(err.inspect_err(() => {})).toBe(err);
  });
});

describe("Testing `and` method", () => {
  test("`Ok` and `Err` should return `Err`", () => {
    const ok = Ok(1);
    const err = Err(2);

    expect(ok.and(err)).toEqual(Err(2));
  });

  test("`Err` and `Ok` should return `Err`", () => {
    const ok = Ok<number, number>(3);
    const err = Err(4);

    expect(err.and(ok)).toEqual(Err(4));
  });

  test("`Ok` and `Ok` should return the last `Ok`", () => {
    const ok1 = Ok(5);
    const ok2 = Ok(6);

    expect(ok1.and(ok2)).toEqual(Ok(6));
  });

  test("`Err` and `Err` should return the first `Err`", () => {
    const err1 = Err(7);
    const err2 = Err(8);

    expect(err1.and(err2)).toEqual(Err(7));
  });
});

describe("Testing `and_then` method", () => {
  test("`Ok` should run the `func` parameter and return its value", () => {
    const ok = Ok("Hello");
    const result = ok.and_then((value) => {
      return Ok(value+" World");
    });
    expect(result).toEqual(Ok("Hello World"));
  });

  test("`Err` should not run the `func` parameter", (done) => {
    const err = Err(new Error());
    err.and_then(() => {
      done("`and_then` function was executed");
      unreachable();
    });
    done();
  });
});

describe("Testing `err` method", () => {
  test("`Ok` should return `None`", () => {
    const ok = Ok("Cara Mia Addio");
    expect(ok.err()).toEqual(None());
  });

  test("`Err` should return `Some` with its value wrapped", () => {
    const err = Err(1_11_21_1211_111221);
    expect(err.err()).toEqual(Some(1_11_21_1211_111221));
  });
});

describe("Testing `expect` method", () => {
  test("`Ok` should not panic and should return its wrapped value", () => {
    const ok = Ok("Mate");
    expect(ok.expect("Mensage de error")).toBe("Mate");
  });

  test("`Err` should panic", () => {
    const err = Err("Rayo McQueen");
    expect(() => err.expect("Error message")).toThrow();
  });
});