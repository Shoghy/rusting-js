import { expect, test, describe } from "bun:test";
import { Err, Ok, Result } from "../src/result";
import { unreachable } from "../src/panic";
import { None, Some } from "../src/option";
import { RandomInt, RandomString } from "./random";

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
  test("`Ok` should return its wrapped value", () => {
    const ok = Ok("Mate");
    expect(ok.expect("Mensage de error")).toBe("Mate");
  });

  test("`Err` should panic", () => {
    const err = Err("Rayo McQueen");
    expect(() => err.expect("Error message")).toThrow();
  });
});

describe("Testing `expect_err` method", () => {
  test("`Ok` should panic", () => {
    const ok = Ok(23);
    expect(() => ok.expect_err("EEEEEERRRRROOOOORRR")).toThrow();
  });

  test("`Err` should return its wrapped value", () => {
    const err = Err(12);
    expect(err.expect_err("YOLO")).toBe(12);
  });
});

describe("Testing `is_err_and` method", () => {
  const r_true = () => true;
  const r_false = () => false;

  test("`Ok` should always return false", () => {
    const ok = Ok({hola: "mundo"});

    expect(ok.is_err_and(r_true)).toBeFalse();
    expect(ok.is_err_and(r_false)).toBeFalse();
  });

  test("`Ok` should not execute the `func` parameter", (done) => {
    const ok = Ok("This is an `Ok`");
    ok.is_err_and(() => {
      done("`is_err_and` method was executed");
      unreachable();
    });
    done();
  });

  test("`Err` should execute the `func` parameter and return its returned value", () => {
    const err = Err(55);

    expect(err.is_err_and(r_true)).toBeTrue();
    expect(err.is_err_and(r_false)).toBeFalse();
    expect(err.is_err_and((val) => val === 55)).toBeTrue();
    expect(err.is_err_and((val) => val === 77)).toBeFalse();
  });
});

describe("Testing `is_ok_and` method", () => {
  const r_true = () => true;
  const r_false = () => false;

  test("`Err` should always return false", () => {
    const err = Err("Copy + Paste");

    expect(err.is_ok_and(r_true)).toBeFalse();
    expect(err.is_ok_and(r_false)).toBeFalse();
  });

  test("`Err` should not execute the `func` parameter", (done) => {
    const err = Err("This is an `Err`");
    err.is_ok_and(() => {
      done("`is_ok_and` method was executed");
      unreachable();
    });
    done();
  });

  test("`Ok` should execute the `func` parameter and return its returned value", () => {
    const ok = Ok(77);

    expect(ok.is_ok_and(r_true)).toBeTrue();
    expect(ok.is_ok_and(r_false)).toBeFalse();
    expect(ok.is_ok_and((val) => val === 55)).toBeFalse();
    expect(ok.is_ok_and((val) => val === 77)).toBeTrue();
  });
});

describe("Testing `map` method", () => {
  test("`Ok` should execute the `func` parameter and return its returned value wrapped in a `Ok`", () => {
    const num = RandomInt(1, 100);
    const ok1 = Ok(num);
    const result1 = ok1.map((value) => value*value);

    expect(result1.is_ok()).toBeTrue();
    expect(result1.unwrap()).toBe(num*num);

    const str1 = RandomString(7);
    const str2 = RandomString(7);
    const ok2 = Ok(str1);
    const result2 = ok2.map((value) => value+str2);

    expect(result2.is_ok()).toBeTrue();
    expect(result2.unwrap()).toBe(str1+str2);
  });

  test("`Err` should not execute the `func` parameter", (done) => {
    const err = Err(RandomInt(1, 100));
    err.map(() => {
      done("`map` method was executed");
    });
    done();
  });

  test("`Err` should return its value wrapped in a `Err`", () => {
    const str = RandomString(11);
    const err = Err(str);
    const result = err.map(() => {});

    expect(result).toEqual(Err(str));
  });
});

describe("Testing `map_err` method", () => {
  test("`Err` should execute the `func` parameter and return its returned value wrapped in a `Err`", () => {
    const num = RandomInt(1, 100);
    const err = Err(num);
    const result1 = err.map_err((value) => value*value);

    expect(result1.is_err()).toBeTrue();
    expect(result1.unwrap_err()).toBe(num*num);

    const str1 = RandomString(7);
    const str2 = RandomString(7);
    const err2 = Err(str1);
    const result2 = err2.map_err((value) => value+str2);

    expect(result2.is_err()).toBeTrue();
    expect(result2.unwrap_err()).toBe(str1+str2);
  });

  test("`Ok` should not execute the `func` parameter", (done) => {
    const ok = Ok(RandomInt(1, 100));
    ok.map_err(() => {
      done("`map_err` method was executed");
    });
    done();
  });

  test("`Ok` should return its value wrapped in a `Ok`", () => {
    const str = RandomString(11);
    const ok = Ok(str);
    const result = ok.map_err(() => {});

    expect(result).toEqual(Ok(str));
  });
});