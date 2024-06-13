import { expect, test, describe } from "bun:test";
import { None, Some } from "../src/option";

describe("Testing `is_none` method", () => {
  test("`None` should return true", () => {
    const val = None();
    expect(val.is_none()).toBe(true);
  });

  test("`Some` should return false", () => {
    const val = Some(0);
    expect(val.is_none()).toBe(false);
  });
});

describe("Testing `is_some` method", () => {
  test("`None` should return false", () => {
    const val = None();
    expect(val.is_some()).toBe(false);
  });

  test("`Some` should return true", () => {
    const val = Some(0);
    expect(val.is_some()).toBe(true);
  });
});

describe("Testing `unwrap` method", () => {
  test("`None` should throw an exception", () => {
    const none = None<string>();
    let val = "Dr. House";

    expect(() =>{
      val = none.unwrap();
    }).toThrow(new Error("`Option` is None"));

    expect(val).toBe("Dr. House");
  });

  test("`Some` should not throw an exception and should return its wrapped value", () => {
    const some = Some(1);
    let val = 0;

    expect(() => {
      val = some.unwrap();
    }).not.toThrow();

    expect(val).toBe(1);
  });
});

describe("test `expect` method", () => {
  const msg = "This should throw an exception";

  test("`None` should throw an exception with the same message", () => {
    const none = None<number[]>();
    let val = [1, 2, 3];

    expect(() => {
      val = none.expect(msg);
    }).toThrow(new Error(msg));

    expect(val).toEqual([1, 2, 3]);
  });

  test("`Some` should not thow an exception and should return its wrapped value", () => {
    const some = Some(2);
    let val = 3;

    expect(() => {
      val = some.expect(msg);
    }).not.toThrow();

    expect(val).toBe(2);
  });
});

describe("Testing `None` and `Some` equality", () => {
  const some = Some(1);
  const none = None();

  test("`None` and `Some` should not be equal", () => {
    expect(none).not.toEqual(some);
    expect(none).not.toEqual(Some(undefined));
    expect(None()).not.toEqual(Some(undefined));
  });

  test("`None` should equal `None`",  () => {
    expect(none).toEqual(None());
    expect(None()).toEqual(None());
  });

  test("`Some` should be equal to `Some` if they hold the same value", () => {
    expect(some).toEqual(Some(1));
    expect(Some("Piña")).toEqual(Some("Piña"));
  });

  test("`Some` should not be equal to `Some` if they don't hold the same value", () => {
    expect(some).not.toEqual(Some(32));
    expect(some).not.toEqual(Some("Piña"));
    expect(Some("Bob")).not.toEqual(Some("Piña"));
  });
});

describe("Testing `inspect` method", () => {
  test("`None` should not execute `inspect`", () => {
    const none = None<number>();
    let val = 275;

    expect(() => none.inspect((value) => {
      val = value;
      throw Error("This should not be throwed");
    })).not.toThrow();

    expect(val).toBe(275);
  });

  test("`Some` should execute `inspect`", () => {
    const some = Some([1, 2, 3]);
    let val = [32, 15, 26];

    expect(() => some.inspect((value) => {
      val = value;
      throw Error("This should be throwed");
    })).toThrow();

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

describe("Testing `or_else` method", () => {
  test("`None` should execute `or_else`", () => {
    const none = None<number[]>();
    const result = none.or_else(() => {
      return Some([4, 20]);
    });
    expect(result).toEqual(Some([4, 20]));
  });

  test("`Some` should not execute `or_else`", () => {
    const some = Some(69);
    const result = some.or_else(() => {
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

test("`and_then` should not execute ", () => {
  const none = None<number>();
  const result = none.and_then((value) => {
    return Some(value * value);
  });
  expect(result).toEqual(None());
});

test("`and_then` should execute ", () => {
  const some = Some(5);
  const result = some.and_then((value) => {
    return Some(value * value);
  });
  expect(result).toEqual(Some(25));
});

test("`get_or_insert` should change the value of `None`", () => {
  const option = None<number>();
  const result = option.get_or_insert(3.1415);
  expect(result).toBe(3.1415);
  expect(option).toEqual(Some(3.1415));
});

test("`get_or_insert` should not change the value of `Some`", () => {
  const option = Some(42);
  const result = option.get_or_insert(9+10); //21
  expect(result).toBe(42);
  expect(option).toEqual(Some(42));
});

test("`get_or_insert_with` should change the value of `None`", () => {
  const option = None<string[]>();
  const result = option.get_or_insert_with(
    () => Array.from("Hello World!")
  );
  expect(result).toEqual(Array.from("Hello World!"));
  expect(option).toEqual(Some(Array.from("Hello World!")));
});

test("`get_or_insert_with` should not change the value of `Some`", () => {
  const option = Some("Cards Against Humanity");
  const result = option.get_or_insert_with(
    () => "Humanity"
  );
  expect(result).toEqual("Cards Against Humanity");
  expect(option).toEqual(Some("Cards Against Humanity"));
});

test("`insert` should change the value of `Option`", () => {
  const cool_song = "https://open.spotify.com/track/4S3dFI8Sx3UsKOUnoYFCg2";

  const option1 = None<string>();
  const result1 = option1.insert(cool_song);
  expect(result1).toBe(cool_song);
  expect(option1).not.toEqual(None());
  expect(option1).toEqual(Some(cool_song));

  const option2 = Some(1);
  const result2 = option2.insert(2);
  expect(result2).toBe(2);
  expect(option2).not.toEqual(Some(1));
  expect(option2).toEqual(Some(2));
});

test("`is_some_and` should be false if `Option` is `None`", () => {
  const r_true = () => true;
  const r_false = () => false;

  const none = None();

  expect(none.is_some_and(r_true)).toBe(false);
  expect(none.is_some_and(r_false)).toBe(false);
});

test("testing `is_some_and` with `Some`", () => {
  const r_true = () => true;
  const r_false = () => false;

  const some = Some(1);

  expect(some.is_some_and(r_true)).toBe(true);
  expect(some.is_some_and(r_false)).toBe(false);
  expect(some.is_some_and((value) => value == 1)).toBe(true);
  expect(some.is_some_and((value) => value == 2)).toBe(false);
});

test("testing `take` method", () => {
  let option1 = Some(142857);
  let option2 = option1.take();

  expect(option1).toEqual(None());
  expect(option2).toEqual(Some(142857));

  option2 = option1.take();
  expect(option1).toEqual(None());
  expect(option2).toEqual(None());

  option1 = None();
  option2 = option1.take();
  expect(option1).toEqual(None());
  expect(option2).toEqual(None());
});

test("`unwrap_or` should be called ", () => {
  const none = None<string>();
  const result = none.unwrap_or("31 minutos");
  expect(result).toBe("31 minutos");
});

test("`unwrap_or` should not be called ", () => {
  const some = Some("Mr. Trance");
  const result = some.unwrap_or("Esteman");
  expect(result).toBe("Mr. Trance");
});

test("`unwrap_or_else` should be called ", () => {
  const none = None<number>();
  const result = none.unwrap_or_else(() => 0xe0218a);
  expect(result).toBe(0xe0218a);
});

test("`unwrap_or_else` should not be called ", () => {
  const some = Some(0);
  const result = some.unwrap_or_else(() => 1);
  expect(result).toBe(0);
});

test("testing `zip` method", () => {
  let val1 = Some(1);
  let val2 = None<string>();
  expect(val1.zip(val2)).toEqual(None());

  val1 = None();
  val2 = Some("thing");
  expect(val1.zip(val2)).toEqual(None());

  val1 = Some(0+0+7);
  val2 = Some("Agente");
  expect(val1.zip(val2)).toEqual(Some([7, "Agente"]));

  val1 = None();
  val2 = None();
  expect(val1.zip(val2)).toEqual(None());
});
