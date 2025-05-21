import { expect, test, describe } from "bun:test";
import { Err, Ok, type Result } from "../../src/enums/result.ts";
import { unreachable } from "../../src/panic.ts";
import { None, Some } from "../../src/enums/option.ts";
import { randomInt, randomString } from "../random.ts";

describe("Testing `isOk` method", () => {
  test("`Ok` should return true", () => {
    const ok = Ok(1);
    expect(ok.isOk()).toBeTrue();
  });

  test("`Err` should return false", () => {
    const err = Err(1);
    expect(err.isOk()).toBeFalse();
  });
});

describe("Testing `isErr` method", () => {
  test("`Ok` should return false", () => {
    const ok = Ok(1);
    expect(ok.isErr()).toBeFalse();
  });

  test("`Err` should return true", () => {
    const err = Err(1);
    expect(err.isErr()).toBeTrue();
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

describe("Testing `inspectErr` method", () => {
  test("`Ok` should not run the `func` parameter", (done) => {
    const ok = Ok([1, 2, 3]);
    ok.inspectErr(() => {
      done("`inspectErr` was executed");
    });

    done();
  });

  test("`Err` should run the `func` parameter", () => {
    let val = "System is working";
    const err = Err("System is not working");
    err.inspectErr((value) => {
      val = value;
    });

    expect(val).toEqual("System is not working");
  });

  test("`Ok` and `Err` should return themselves", () => {
    const ok = Ok("C#"); //Microsoft flavored JAVA
    const err = Err("JAVA");

    expect(ok.inspectErr(() => {})).toBe(ok);
    expect(err.inspectErr(() => {})).toBe(err);
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

describe("Testing `andThen` method", () => {
  test("`Ok` should run the `func` parameter and return its value", () => {
    const ok = Ok("Hello");
    const result = ok.andThen((value) => {
      return Ok(value + " World");
    });
    expect(result).toEqual(Ok("Hello World"));
  });

  test("`Err` should not run the `func` parameter", (done) => {
    const err = Err(new Error());
    err.andThen(() => {
      done("`andThen` function was executed");
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
    expect(ok.expect("Mensaje de error")).toBe("Mate");
  });

  test("`Err` should panic", () => {
    const err = Err("Rayo McQueen");
    expect(() => err.expect("Error message")).toThrow();
  });
});

describe("Testing `expectErr` method", () => {
  test("`Ok` should panic", () => {
    const ok = Ok(23);
    expect(() => ok.expectErr("EEEEEERRRRROOOOORRR")).toThrow();
  });

  test("`Err` should return its wrapped value", () => {
    const err = Err(12);
    expect(err.expectErr("YOLO")).toBe(12);
  });
});

describe("Testing `isErrAnd` method", () => {
  const rTrue = () => true;
  const rFalse = () => false;

  test("`Ok` should always return false", () => {
    const ok = Ok({ hola: "mundo" });

    expect(ok.isErrAnd(rTrue)).toBeFalse();
    expect(ok.isErrAnd(rFalse)).toBeFalse();
  });

  test("`Ok` should not execute the `func` parameter", (done) => {
    const ok = Ok("This is an `Ok`");
    ok.isErrAnd(() => {
      done("`isErrAnd` method was executed");
      unreachable();
    });
    done();
  });

  test("`Err` should execute the `func` parameter and return its returned value", () => {
    const err = Err(55);

    expect(err.isErrAnd(rTrue)).toBeTrue();
    expect(err.isErrAnd(rFalse)).toBeFalse();
    expect(err.isErrAnd((val) => val === 55)).toBeTrue();
    expect(err.isErrAnd((val) => val === 77)).toBeFalse();
  });
});

describe("Testing `isOkAnd` method", () => {
  const rTrue = () => true;
  const rFalse = () => false;

  test("`Err` should always return false", () => {
    const err = Err("Copy + Paste");

    expect(err.isOkAnd(rTrue)).toBeFalse();
    expect(err.isOkAnd(rFalse)).toBeFalse();
  });

  test("`Err` should not execute the `func` parameter", (done) => {
    const err = Err("This is an `Err`");
    err.isOkAnd(() => {
      done("`isOkAnd` method was executed");
      unreachable();
    });
    done();
  });

  test("`Ok` should execute the `func` parameter and return its returned value", () => {
    const ok = Ok(77);

    expect(ok.isOkAnd(rTrue)).toBeTrue();
    expect(ok.isOkAnd(rFalse)).toBeFalse();
    expect(ok.isOkAnd((val) => val === 55)).toBeFalse();
    expect(ok.isOkAnd((val) => val === 77)).toBeTrue();
  });
});

describe("Testing `map` method", () => {
  test("`Ok` should execute the `func` parameter and return its returned value wrapped in a `Ok`", () => {
    const num1 = randomInt(1, 100);
    const num2 = randomInt(1, 100);
    const ok1 = Ok(num1);
    const result1 = ok1.map((value) => value * num2);

    expect(result1).toEqual(Ok(num1 * num2));

    const str1 = randomString(7);
    const str2 = randomString(7);
    const ok2 = Ok(str1);
    const result2 = ok2.map((value) => value + str2);

    expect(result2).toEqual(Ok(str1 + str2));
  });

  test("`Err` should not execute the `func` parameter", (done) => {
    const err = Err(randomInt(1, 100));
    err.map(() => {
      done("`map` method was executed");
    });
    done();
  });

  test("`Err` should return its value wrapped in a `Err`", () => {
    const str = randomString(11);
    const err = Err(str);
    const result = err.map(() => {});

    expect(result).toEqual(Err(str));
  });
});

describe("Testing `mapErr` method", () => {
  test("`Err` should execute the `func` parameter and return its returned value wrapped in a `Err`", () => {
    const num1 = randomInt(1, 100);
    const num2 = randomInt(1, 100);
    const err = Err(num1);
    const result1 = err.mapErr((value) => value * num2);

    expect(result1).toEqual(Err(num1 * num2));

    const str1 = randomString(7);
    const str2 = randomString(7);
    const err2 = Err(str1);
    const result2 = err2.mapErr((value) => value + str2);

    expect(result2).toEqual(Err(str1 + str2));
  });

  test("`Ok` should not execute the `func` parameter", (done) => {
    const ok = Ok(randomInt(1, 100));
    ok.mapErr(() => {
      done("`mapErr` method was executed");
    });
    done();
  });

  test("`Ok` should return its value wrapped in a `Ok`", () => {
    const str = randomString(11);
    const ok = Ok(str);
    const result = ok.mapErr(() => {});

    expect(result).toEqual(Ok(str));
  });
});

describe("Testing `mapOr` method", () => {
  test("`Ok` should execute the func parameter and return its returned value", () => {
    const def = randomInt(1, 100);
    const num = randomInt(101, 200);
    const ok = Ok(num);
    const result = ok.mapOr(def, (value) => {
      return (value * value + value) / 2;
    });

    expect(result).toBe((num * num + num) / 2);
  });

  test("`Err` should not execute the func parameter and should return def", (done) => {
    const def = randomString(11);
    const err = Err([7, 7, 7]);

    const result = err.mapOr(def, () => {
      done("`mapOr` was executed");
      unreachable();
    });

    expect(result).toBe(def);
    done();
  });
});

describe("Testing `ok` method", () => {
  test("`Ok` should return a its value wrapped in a `Some`", () => {
    const str = randomString(11);
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
    const str = randomString(11);
    const num = randomInt(1, 100);

    const ok: R = Ok(str);
    const err: R = Err(num);

    expect(ok.or(err)).toEqual(Ok(str));
  });

  test("`Err` and `Ok` should return `Ok`", () => {
    const str = randomString(11);
    const num = randomInt(1, 100);

    const ok: R = Ok(str);
    const err: R = Err(num);

    expect(err.or(ok)).toEqual(Ok(str));
  });

  test("`Ok` and `Ok` should return the first `Ok`", () => {
    const str1 = randomString(11);
    const str2 = randomString(11);

    const ok1: R = Ok(str1);
    const ok2: R = Ok(str2);

    expect(ok1.or(ok2)).toEqual(Ok(str1));
  });

  test("`Err` and `Err` should return the last `Err`", () => {
    const num1 = randomInt(1, 100);
    const num2 = randomInt(1, 100);

    const err1: R = Err(num1);
    const err2: R = Err(num2);

    expect(err1.or(err2)).toEqual(Err(num2));
  });
});

describe("Testing `unwrap` method", () => {
  test("`Ok` should return its wrapped value", () => {
    const str = randomString(11);
    const ok = Ok(str);
    expect(ok.unwrap()).toBe(str);
  });

  test("`Err` should panic", () => {
    const err = Err("This value will no be used :(");
    expect(() => err.unwrap()).toThrowError(
      "Called `unwrap` method on a `Err`",
    );
  });
});

describe("Testing `unwrapErr` method", () => {
  test("`Ok` should panic", () => {
    const ok = Ok(["F", "e", "l", "p", "s"]); // ._.
    expect(() => ok.unwrapErr()).toThrowError(
      "Called `unwrapErr` method on a `Ok`",
    );
  });

  test("`Err` should return its wrapped value", () => {
    const err = Err(new Error("Hey, this ain't a string or number"));
    expect(err.unwrapErr()).toEqual(
      new Error("Hey, this ain't a string or number"),
    );
  });
});

describe("Testing `unwrapOr` method", () => {
  test("`Ok` should return its wrapped value", () => {
    const ok = Ok(Some(1));
    expect(ok.unwrapOr(None())).toEqual(Some(1));
  });

  test("`Err` should return the `def` parameter", () => {
    const str = randomString(11);
    const err = Err(new TypeError("11"));
    expect(err.unwrapOr(str)).toEqual(str);
  });
});

describe("Testing `unwrapOrElse` method", () => {
  test("`Ok` should return its wrapped value", () => {
    const str = randomString(11);
    const ok = Ok(str);

    const result = ok.unwrapOrElse(() => {
      unreachable(
        "`unwrapOrElse` don't execute the `func` parameter if is called by an `Ok`",
      );
    });

    expect(result).toBe(str);
  });

  test("`Err` should execute the `func` parameter and return its returned value", () => {
    const str1 = randomString(11);
    const str2 = randomString(11);
    const err = Err(str1);

    const result = err.unwrapOrElse((value) => {
      return value + str2;
    });

    expect(result).toBe(str1 + str2);
  });
});

describe("Testing `match` method", () => {
  test("`Ok` should execute the `ok` arm", (done) => {
    const num = randomInt(1, 100);
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
    const str = randomString(11);
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

describe("Testing `ifOk` method", () => {
  test("`Ok` should execute the `func` parameter", (done) => {
    const num = randomInt(1, 100);
    const ok = Ok(num);

    ok.ifOk((value) => {
      expect(value).toBe(num);
      done();
    });

    done("`ifOk` was not executed");
  });

  test("`Err` should not execute the `func` parameter`", (done) => {
    const err = Err(new Error("Hey another unused value"));

    err.ifOk(() => {
      done("`ifOk` was executed");
    });

    done();
  });
});

describe("Testing `ifErr` method", () => {
  test("`Ok` should not execute the `func` parameter", (done) => {
    const ok = Ok(None());

    ok.ifErr(() => {
      done("`ifErr` was executed");
    });

    done();
  });

  test("`Err` should execute the `func` parameter", (done) => {
    const str = randomString(11);
    const err = Err(str);

    err.ifErr((value) => {
      expect(value).toBe(str);
      done();
    });

    done("`ifErr` was not executed");
  });
});

describe("Testing `mapOrElse` method", () => {
  test("`Ok` should execute the `f` parameter and return its returned value", () => {
    const str1 = randomString(11);
    const str2 = randomString(11);
    const ok = Ok(str1);

    const result = ok.mapOrElse(
      () => unreachable(),
      (value) => value + str2,
    );

    expect(result).toBe(str1 + str2);
  });

  test("`Err` should execute the `def` parameter and return its returned value", () => {
    const str1 = randomString(11);
    const str2 = randomString(11);
    const err = Err(str1);

    const result = err.mapOrElse(
      (value) => value + str2,
      () => unreachable(),
    );

    expect(result).toBe(str1 + str2);
  });
});
