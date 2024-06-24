import { expect, test, describe } from "bun:test";
import { Err, Ok, Result } from "../src/result";

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
