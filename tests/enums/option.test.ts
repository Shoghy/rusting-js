import { expect, test, describe } from "bun:test";
import { None, Some } from "../../src/enums";
import { Err, Ok } from "../../src/enums";
import { panic, unreachable } from "../../src/panic";

describe("Testing `isNone` method", () => {
  test("`None` should return true", () => {
    const val = None();
    expect(val.isNone()).toBe(true);
  });

  test("`Some` should return false", () => {
    const val = Some(0);
    expect(val.isNone()).toBe(false);
  });
});

describe("Testing `isSome` method", () => {
  test("`None` should return false", () => {
    const val = None();
    expect(val.isSome()).toBe(false);
  });

  test("`Some` should return true", () => {
    const val = Some(0);
    expect(val.isSome()).toBe(true);
  });
});

describe("Testing `unwrap` method", () => {
  test("`None` should panic", () => {
    const none = None<string>();
    let val = "Dr. House";

    expect(() => {
      val = none.unwrap();
    }).toThrow();

    expect(val).toBe("Dr. House");
  });

  test("`Some` should not panic and should return its wrapped value", () => {
    const some = Some(1);
    let val = 0;

    expect(() => {
      val = some.unwrap();
    }).not.toThrow();

    expect(val).toBe(1);
  });
});

describe("Testing `expect` method", () => {
  const msg = "This should panic";

  test("`None` should panic", () => {
    const none = None<number[]>();
    let val = [1, 2, 3];

    expect(() => {
      val = none.expect(msg);
    }).toThrow();

    expect(val).toEqual([1, 2, 3]);
  });

  test("`Some` should not panic and should return its wrapped value", () => {
    const some = Some(2);
    let val = 3;

    expect(() => {
      val = some.expect(msg);
    }).not.toThrow();

    expect(val).toBe(2);
  });
});

describe("Testing `inspect` method", () => {
  test("`None` should not execute `inspect`", () => {
    const none = None<number>();
    let val = 275;

    expect(() =>
      none.inspect((value) => {
        val = value;
        unreachable();
      }),
    ).not.toThrow();

    expect(val).toBe(275);
  });

  test("`Some` should execute `inspect`", () => {
    const some = Some([1, 2, 3]);
    let val = [32, 15, 26];

    expect(() =>
      some.inspect((value) => {
        val = value;
        panic("This should be thrown");
      }),
    ).toThrow();

    expect(val).toEqual([1, 2, 3]);
  });
});

describe("Testing `or` method", () => {
  test("`Some` and `None` should return `Some`", () => {
    const some = Some("lorem");
    const none = None<string>();
    expect(some.or(none)).toEqual(Some("lorem"));
  });

  test("`None` and `Some` should return `Some`", () => {
    const none = None<string>();
    const some = Some("6.02214076 * 10^23");
    expect(none.or(some)).toEqual(Some("6.02214076 * 10^23"));
  });

  test("`Some` and `Some` should return the first `Some`", () => {
    const some1 = Some("あなた");
    const some2 = Some("かわいい");
    expect(some1.or(some2)).toEqual(Some("あなた"));
  });

  test("`None` and `None` should return `None`", () => {
    const none1 = None();
    const none2 = None();
    expect(none1.or(none2)).toEqual(None());
  });
});

describe("Testing `orElse` method", () => {
  test("`None` should execute `orElse`", () => {
    const none = None<number[]>();
    const result = none.orElse(() => {
      return Some([4, 20]);
    });
    expect(result).toEqual(Some([4, 20]));
  });

  test("`Some` should not execute `orElse`", () => {
    const some = Some(69);
    const result = some.orElse(() => {
      return Some(13);
    });
    expect(result).toEqual(Some(69));
  });
});

describe("Testing `xor` method", () => {
  test("`Some` and `None` should return `Some`", () => {
    const some = Some(1);
    const none = None<number>();
    expect(some.xor(none)).toEqual(Some(1));
  });

  test("`None` and `Some` should return `Some`", () => {
    const none = None<string>();
    const some = Some("Severlá");
    expect(none.xor(some)).toEqual(Some("Severlá"));
  });

  test("`Some` and `Some` should return `None`", () => {
    const some1 = Some(18);
    const some2 = Some(13);
    expect(some1.xor(some2)).toEqual(None());
  });

  test("`None` and `None` should return `None`", () => {
    const none1 = None();
    const none2 = None();
    expect(none1.xor(none2)).toEqual(None());
  });
});

describe("Testing `and` method", () => {
  test("`Some` and `None` should return `None`", () => {
    const some = Some("Español");
    const none = None<string>();
    expect(some.and(none)).toEqual(None());
  });

  test("`None` and `Some` should return `None`", () => {
    const none = None<string>();
    const some = Some("Português");
    expect(none.and(some)).toEqual(None());
  });

  test("`Some` and `Some` should return last `Some`", () => {
    const some1 = Some("English");
    const some2 = Some("日本語");
    expect(some1.and(some2)).toEqual(Some("日本語"));
  });

  test("`None` and `None` should return `None`", () => {
    const none1 = None();
    const none2 = None();
    expect(none1.and(none2)).toEqual(None());
  });
});

describe("Testing `andThen` method", () => {
  test("`None` should not execute", () => {
    const none = None<number>();
    const result = none.andThen((value) => {
      return Some(value * value);
    });
    expect(result).toEqual(None());
  });

  test("`Some` should execute", () => {
    const some = Some(5);
    const result = some.andThen((value) => {
      return Some(value * value);
    });
    expect(result).toEqual(Some(25));
  });
});

describe("Testing `getOrInsert` method", () => {
  test("`None` should insert the value", () => {
    const option = None<number>();
    const result = option.getOrInsert(3.1415);
    expect(result).toBe(3.1415);
    expect(option).toEqual(Some(3.1415));
  });

  test("`Some` should not insert the value", () => {
    const option = Some(42);
    const result = option.getOrInsert(9 + 10); //21
    expect(result).toBe(42);
    expect(option).toEqual(Some(42));
  });
});

describe("Testing `getOrInsertWith` method", () => {
  test("`getOrInsertWith` should change the value of `None`", () => {
    const option = None<string[]>();
    const result = option.getOrInsertWith(() => Array.from("Hello World!"));
    expect(result).toEqual(Array.from("Hello World!"));
    expect(option).toEqual(Some(Array.from("Hello World!")));
  });

  test("`getOrInsertWith` should not change the value of `Some`", () => {
    const option = Some("Cards Against Humanity");
    const result = option.getOrInsertWith(() => "Humanity");
    expect(result).toEqual("Cards Against Humanity");
    expect(option).toEqual(Some("Cards Against Humanity"));
  });
});

describe("Testing `insert` method", () => {
  test("`insert` should change the value of `None`", (done) => {
    const cool_song = "https://open.spotify.com/track/4S3dFI8Sx3UsKOUnoYFCg2";

    const option1 = None<string>();
    const result1 = option1.insert(cool_song);
    expect(result1).toBe(cool_song);
    expect(option1.isNone()).toBeFalse();

    option1.match({
      Some(value) {
        expect(value).toBe(cool_song);
      },
      None() {
        done("`insert` didn't change the `None` to `Some`");
      },
    });

    done();
  });

  test("`insert` should change the value of `Some`", (done) => {
    const option2 = Some(1);
    const result2 = option2.insert(2);
    expect(result2).toBe(2);

    option2.match({
      Some(value) {
        expect(value).toBe(2);
      },
      None() {
        done("`insert` changed the value of `Some` to `None`");
      },
    });

    done();
  });
});

describe("Testing `isSomeAnd` method", () => {
  const rTrue = () => true;
  const rFalse = () => false;

  test("`None` should always return false", () => {
    const none = None();

    expect(none.isSomeAnd(rTrue)).toBe(false);
    expect(none.isSomeAnd(rFalse)).toBe(false);
  });

  test("`Some` should execute the function and return its value", () => {
    const some = Some(1);

    expect(some.isSomeAnd(rTrue)).toBe(true);
    expect(some.isSomeAnd(rFalse)).toBe(false);
    expect(some.isSomeAnd((value) => value == 1)).toBe(true);
    expect(some.isSomeAnd((value) => value == 2)).toBe(false);
  });
});

describe("Testing `take` method", () => {
  test("`Some` should transform into `None`", () => {
    const option = Some(142857);
    option.take();
    expect(option).toEqual(None());
  });

  test("`Some` should return its value wrapped in a `Some`", () => {
    const option1 = Some("0xff");
    const option2 = option1.take();
    expect(option2).toEqual(Some("0xff"));
  });

  test("`None` should be left unchanged", () => {
    const none = None();
    none.take();
    expect(none).toEqual(none);
  });

  test("`None` should return `None`", () => {
    const none1 = None();
    const none2 = none1.take();
    expect(none2).toEqual(None());
  });
});

describe("Testing `unwrapOr` method", () => {
  test("`None` should return the `def` value", () => {
    const none = None<string>();
    const result = none.unwrapOr("31 minutos");
    expect(result).toBe("31 minutos");
  });

  test("`Some` should return its own value", () => {
    const some = Some("Mr. Trance");
    const result = some.unwrapOr("Esteman");
    expect(result).toBe("Mr. Trance");
  });
});

describe("Testing `unwrapOrElse` method", () => {
  test("`None` should call the `func` parameter and return its value", () => {
    const none = None<number>();
    const result = none.unwrapOrElse(() => 0xe0218a);
    expect(result).toBe(0xe0218a);
  });

  test("`Some` should just return its own value", () => {
    const some = Some(0);
    const result = some.unwrapOrElse(() => 1);
    expect(result).toBe(0);
  });
});

describe("Testing `zip` method", () => {
  test("`Some` and `None` should return `None`", () => {
    const some = Some(1);
    const none = None<string>();
    expect(some.zip(none)).toEqual(None());
  });

  test("`None` and `Some` should return `None`", () => {
    const none = None<number[]>();
    const some = Some("Tengo que llenar esto con algo");
    expect(none.zip(some)).toEqual(None());
  });

  test("`Some` and `Some` should return `Some` containing the values of the two previous `Some`", () => {
    const some1 = Some("好きな日本語");
    const some2 = Some(135);
    expect(some1.zip(some2)).toEqual(Some(["好きな日本語", 135]));
  });

  test("`None` and `None` should return `None`", () => {
    const none1 = None();
    const none2 = None();
    expect(none1.zip(none2)).toEqual(None());
  });
});

describe("Testing `map` method", () => {
  test("`None` should return `None` without executing the `func` parameter", () => {
    const none = None<string>();
    let val = 1;

    const result = none.map((value) => {
      val = 2;
      return value.length;
    });

    expect(val).toBe(1);
    expect(result).toEqual(None());
  });

  test("`Some` should execute the `func` parameter and return its return value wrapped in a `Some`", () => {
    const boo = "Hipopomonstruoesquipedalofobia";
    const some = Some(boo);
    let val = 1;

    const result = some.map((value) => {
      val = 2;
      return value.length;
    });

    expect(val).toBe(2);
    expect(result).toEqual(Some(boo.length));
  });
});

describe("Testing `mapOr` method", () => {
  test("`None` should not execute the `func` parameter and should return the `def` parameter", () => {
    const none = None();
    let val = 1;

    const result = none.mapOr("La Guia Del Autoestopista Galáctico", () => {
      val = 2;
      return "No se asuste";
    });

    expect(val).toBe(1);
    expect(result).toBe("La Guia Del Autoestopista Galáctico");
  });

  test("`Some` should execute the `func` parameter and return its value", () => {
    const some = Some(0xff);
    let val = 1;

    const result = some.mapOr("THE GREAT PAPYRUS", (value) => {
      val = 2;
      return value.toString(16);
    });

    expect(val).toBe(2);
    expect(result).toBe("ff");
  });
});

describe("Testing `okOr` method", () => {
  test("`None` should return `Err`", () => {
    const none = None();
    const result = none.okOr("Brainfuck");
    expect(result).toEqual(Err("Brainfuck"));
  });

  test("`Some` should return `Ok`", () => {
    const some = Some("Rust lang get its name from a fungus");
    const result = some.okOr("The cake it's a lie");
    expect(result).toEqual(Ok("Rust lang get its name from a fungus"));
  });
});

describe("Testing `okOrElse` method", () => {
  test("`None` should call the `func` parameter and return its return value wrapped in a `Err`", () => {
    const none = None();
    let val = 1;

    const result = none.okOrElse(() => {
      val = 2;
      return 78;
    });

    expect(val).toBe(2);
    expect(result).toEqual(Err(78));
  });

  test("`Some` should return its value wrapped in an `Ok` and should not call the `func` parameter", () => {
    const some = Some("Silksong still doesn't have a release date");
    let val = 1;

    const result = some.okOrElse(() => {
      val = 2;
      return 123456789;
    });

    expect(val).toBe(1);
    expect(result).toEqual(Ok("Silksong still doesn't have a release date"));
  });
});

describe("Testing `unwrapUnchecked` method", () => {
  test("`None` should return `undefined`", () => {
    const none = None();
    const result = none.unwrapUnchecked();
    expect(result).toBe(undefined);
  });

  test("`Some` should return its value", () => {
    const some = Some(53);
    const result = some.unwrapUnchecked();
    expect(result).toBe(53);
  });

  test("`Some` with its value taken should also return `undefined`", () => {
    const option = Some("Hello reader");
    option.take();
    const result = option.unwrapUnchecked();
    expect<unknown>(result).toBe(undefined);
    expect(result).not.toBe("Hello reader");
  });
});

describe("Testing `ifSome` method", () => {
  test("`None` should not call the `func` parameter", () => {
    const none = None();
    let val = 1;

    none.ifSome(() => {
      val = 2;
    });

    expect(val).toBe(1);
  });

  test("`Some` should call the `func` parameter", () => {
    const some = Some(56);
    let val = 1;

    some.ifSome((value) => {
      val = value;
    });

    expect(val).toBe(56);
  });
});

describe("Testing `ifNone` method", () => {
  test("`None` should call the `func` parameter", () => {
    const none = None();
    let val = 1;

    none.ifNone(() => {
      val = 2;
    });

    expect(val).toBe(2);
  });

  test("`Some` should not call the `func` parameter", () => {
    const some = Some(-1);
    let val = 1;

    some.ifNone(() => {
      val = 2;
    });

    expect(val).toBe(1);
  });
});

describe("Testing `match` method", () => {
  test("`None` should call the function in the `none` property", () => {
    const none = None();
    let val = 1;

    none.match({
      None: () => {
        val = 2;
      },
      Some: () => {
        unreachable();
      },
    });

    expect(val).toBe(2);
  });

  test("`Some` should call the function in the `some` property", () => {
    const some = Some(-5);
    let val = 1;

    some.match({
      Some: (value) => {
        val = value;
      },
      None: () => {
        unreachable();
      },
    });

    expect(val).toBe(-5);
  });
});

describe("Testing `mapOrElse` method", () => {
  test("`None` should call the function `def` parameter and return its returned value", () => {
    const none = None();
    let val = 1;

    const result = none.mapOrElse(
      () => {
        val = 2;
        return "What should I put here?";
      },
      () => {
        unreachable();
      },
    );

    expect(val).toBe(2);
    expect(result).toBe("What should I put here?");
  });

  test("`Some` should call the function `f` parameter and return its returned value", () => {
    const some = Some([1, 9, 8, 4]);
    let val = 1;

    const result = some.mapOrElse(
      () => {
        unreachable();
      },
      (value) => {
        val = 2;
        return value[2];
      },
    );

    expect(val).toBe(2);
    expect(result).toBe(8);
  });
});
