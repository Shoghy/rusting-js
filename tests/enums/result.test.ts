import { expect, test, describe } from "bun:test";
import { Err, Ok, Result } from "../../src/enums";
import { unreachable } from "../../src/panic";
import { None, Some } from "../../src/enums";
import { RandomInt, RandomString } from "../random";

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

    expect(ok.inspect(() => { })).toBe(ok);
    expect(err.inspect(() => { })).toBe(err);
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

    expect(ok.inspect_err(() => { })).toBe(ok);
    expect(err.inspect_err(() => { })).toBe(err);
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
      return Ok(value + " World");
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
    const ok = Ok({ hola: "mundo" });

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
    const num1 = RandomInt(1, 100);
    const num2 = RandomInt(1, 100);
    const ok1 = Ok(num1);
    const result1 = ok1.map((value) => value * num2);

    expect(result1).toEqual(Ok(num1 * num2));

    const str1 = RandomString(7);
    const str2 = RandomString(7);
    const ok2 = Ok(str1);
    const result2 = ok2.map((value) => value + str2);

    expect(result2).toEqual(Ok(str1 + str2));
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
    const result = err.map(() => { });

    expect(result).toEqual(Err(str));
  });
});

describe("Testing `map_err` method", () => {
  test("`Err` should execute the `func` parameter and return its returned value wrapped in a `Err`", () => {
    const num1 = RandomInt(1, 100);
    const num2 = RandomInt(1, 100);
    const err = Err(num1);
    const result1 = err.map_err((value) => value * num2);

    expect(result1).toEqual(Err(num1 * num2));

    const str1 = RandomString(7);
    const str2 = RandomString(7);
    const err2 = Err(str1);
    const result2 = err2.map_err((value) => value + str2);

    expect(result2).toEqual(Err(str1 + str2));
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
    const result = ok.map_err(() => { });

    expect(result).toEqual(Ok(str));
  });
});

describe("Testing `map_or` method", () => {
  test("`Ok` should execute the func parameter and return its returned value", () => {
    const def = RandomInt(1, 100);
    const num = RandomInt(101, 200);
    const ok = Ok(num);
    const result = ok.map_or(def, (value) => {
      return (value * value + value) / 2;
    });

    expect(result).toBe((num * num + num) / 2);
  });

  test("`Err` should not execute the func parameter and should return def", (done) => {
    const def = RandomString(11);
    const err = Err([7, 7, 7]);

    const result = err.map_or(def, () => {
      done("`map_or` was executed");
      unreachable();
    });

    expect(result).toBe(def);
    done();
  });
});

describe("Testing `ok` method", () => {
  test("`Ok` should return a its value wrapped in a `Some`", () => {
    const str = RandomString(11);
    const ok = Ok(str);

    expect(ok.ok()).toEqual(Some(str));
  });

  test("`Err` should return `None`", () => {
    const err = Err("OMG, another literal");

    expect(err.ok()).toEqual(None());
  });
});

describe("Testing `or` method", () => {
  type R = Result<string, number>;

  test("`Ok` and `Err` should return `Ok`", () => {
    const str = RandomString(11);
    const num = RandomInt(1, 100);

    const ok: R = Ok(str);
    const err: R = Err(num);

    expect(ok.or(err)).toEqual(Ok(str));
  });

  test("`Err` and `Ok` should return `Ok`", () => {
    const str = RandomString(11);
    const num = RandomInt(1, 100);

    const ok: R = Ok(str);
    const err: R = Err(num);

    expect(err.or(ok)).toEqual(Ok(str));
  });

  test("`Ok` and `Ok` should return the first `Ok`", () => {
    const str1 = RandomString(11);
    const str2 = RandomString(11);

    const ok1: R = Ok(str1);
    const ok2: R = Ok(str2);

    expect(ok1.or(ok2)).toEqual(Ok(str1));
  });

  test("`Err` and `Err` should return the last `Err`", () => {
    const num1 = RandomInt(1, 100);
    const num2 = RandomInt(1, 100);

    const err1: R = Err(num1);
    const err2: R = Err(num2);

    expect(err1.or(err2)).toEqual(Err(num2));
  });
});

describe("Testing `unwrap` method", () => {
  test("`Ok` should return its wrapped value", () => {
    const str = RandomString(11);
    const ok = Ok(str);
    expect(ok.unwrap()).toBe(str);
  });

  test("`Err` should panic", () => {
    const err = Err("This value will no be used :(");
    expect(() => err.unwrap()).toThrowError("Called `unwrap` method on a `Err`");
  });
});

describe("Testing `unwrap_err` method", () => {
  test("`Ok` should panic", () => {
    const ok = Ok(["F", "e", "l", "p", "s"]); // ._.
    expect(() => ok.unwrap_err()).toThrowError("Called `unwrap_err` method on a `Ok`");
  });

  test("`Err` should return its wrapped value", () => {
    const err = Err(new Error("Hey, this ain't a string or number"));
    expect(err.unwrap_err()).toEqual(new Error("Hey, this ain't a string or number"));
  });
});

describe("Testing `unwrap_or` method", () => {
  test("`Ok` should return its wrapped value", () => {
    const ok = Ok(Some(1));
    expect(ok.unwrap_or(None())).toEqual(Some(1));
  });

  test("`Err` should return the `def` parameter", () => {
    const str = RandomString(11);
    const err = Err(new TypeError("11"));
    expect(err.unwrap_or(str)).toEqual(str);
  });
});

describe("Testing `unwrap_or_else` method", () => {
  test("`Ok` should return its wrapped value", () => {
    const str = RandomString(11);
    const ok = Ok(str);

    const result = ok.unwrap_or_else(() => {
      unreachable("`unwrap_or_else` don't execute the `func` parameter if is called by an `Ok`");
    });

    expect(result).toBe(str);
  });

  test("`Err` should execute the `func` parameter and return its returned value", () => {
    const str1 = RandomString(11);
    const str2 = RandomString(11);
    const err = Err(str1);

    const result = err.unwrap_or_else((value) => {
      return value + str2;
    });

    expect(result).toBe(str1 + str2);
  });
});

describe("Testing `match` method", () => {
  test("`Ok` should execute the `ok` arm", (done) => {
    const num = RandomInt(1, 100);
    const ok = Ok(num);
    ok.match({
      Ok(value) {
        expect(value).toBe(num);
        done();
      },
      Err() {
        done("`err` arm was executed");
      },
    });
    done("No arm was executed");
  });

  test("`Err` should execute the `err` arm", (done) => {
    const str = RandomString(11);
    const err = Err(str);
    err.match({
      Err(value) {
        expect(value).toBe(str);
        done();
      },
      Ok() {
        done("`ok` arm was executed");
      },
    });
    done("No arm was executed");
  });
});

describe("Testing `if_ok` method", () => {
  test("`Ok` should execute the `func` parameter", (done) => {
    const num = RandomInt(1, 100);
    const ok = Ok(num);

    ok.if_ok((value) => {
      expect(value).toBe(num);
      done();
    });

    done("`if_ok` was not executed");
  });

  test("`Err` should not execute the `func` parameter`", (done) => {
    const err = Err(new Error("Hey another unused value"));

    err.if_ok(() => {
      done("`if_ok` was executed");
    });

    done();
  });
});

describe("Testing `if_err` method", () => {
  test("`Ok` should not execute the `func` parameter", (done) => {
    const ok = Ok(None());

    ok.if_err(() => {
      done("`if_err` was executed");
    });

    done();
  });

  test("`Err` should execute the `func` parameter", (done) => {
    const str = RandomString(11);
    const err = Err(str);

    err.if_err((value) => {
      expect(value).toBe(str);
      done();
    });

    done("`if_err` was not executed");
  });
});

describe("Testing `map_or_else` method", () => {
  test("`Ok` should execute the `f` parameter and return its returned value", () => {
    const str1 = RandomString(11);
    const str2 = RandomString(11);
    const ok = Ok(str1);

    const result = ok.map_or_else(
      () => unreachable(),
      (value) => value + str2,
    );

    expect(result).toBe(str1 + str2);
  });

  test("`Err` should execute the `def` parameter and return its returned value", () => {
    const str1 = RandomString(11);
    const str2 = RandomString(11);
    const err = Err(str1);

    const result = err.map_or_else(
      (value) => value + str2,
      () => unreachable(),
    );

    expect(result).toBe(str1 + str2);
  });
});
