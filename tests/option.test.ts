import { expect, test } from 'bun:test';
import { None, Some } from '../src/option';

test('`is_none` should be true', () => {
  const val = None();
  expect(val.is_none()).toBe(true);
});

test('`is_some` should be false', () => {
  const val = None();
  expect(val.is_some()).toBe(false);
});

test('`is_none` should be false', () => {
  const val = Some(0);
  expect(val.is_none()).toBe(false);
});

test('`is_some` should be true', () => {
  const val = Some(0);
  expect(val.is_some()).toBe(true);
});

test('`unwrap` should throw exception', () => {
  const val = None();
  expect(() => val.unwrap()).toThrow(new Error("`Option` is None"));
});

test('successfully `unwrap`', () => {
  const option = Some(1);
  const val = option.unwrap();
  expect(val).toBe(1);
});

test('`expect` should throw exception', () => {
  const val = None();
  const msg = "This should throw an exception";
  expect(() => val.expect(msg)).toThrow(new Error(msg));
});

test('successfully `expect`', () => {
  const option = Some(1);
  const val = option.expect("This should not throw an error");
  expect(val).toBe(1);
});

test('testing `None` and `Some` equality', () => {
  const some = Some(1);
  const none = None();

  expect(none).toEqual(None());
  expect(none).not.toEqual(some);
  expect(some).toEqual(Some(1));
  expect(some).not.toEqual(Some(2));
  expect(some).not.toEqual(Some("1"));
});

test('`inspect` should not execute', () => {
  const val = None();
  expect(() => val.inspect(() => {
    throw Error("This code should not be reached");
  })).not.toThrow();
});

test('`inspect` should execute', () => {
  const val = Some([1, 2, 3]);
  expect(() => val.inspect((v) => {
    expect(v).toEqual([1, 2, 3]);
    throw Error("Exception should be throwed");
  })).toThrow();
});

test('testing `or` method', () => {
  let val1 = Some("lorem");
  let val2 = None<string>();
  expect(val1.or(val2)).toEqual(Some("lorem"));

  val1 = None();
  val2 = Some("6.02214076 * 10^23");
  expect(val1.or(val2)).toEqual(Some("6.02214076 * 10^23"));

  val1 = Some("あなた");
  val2 = Some("かわいい");
  expect(val1.or(val2)).toEqual(Some("あなた"));

  val1 = None();
  val2 = None();
  expect(val1.or(val2)).toEqual(None());
});

test('`or_else` should execute', () => {
  const val = None<number[]>();
  const result = val.or_else(() => {
    return Some([4, 20]);
  });
  expect(result).not.toEqual(None());
  expect(result).toEqual(Some([4, 20]));
});

test('`or_else` should not execute', () => {
  const val = Some(12);
  const result = val.or_else(() => {
    return Some(69);
  });
  expect(result).not.toEqual(Some(69));
  expect(result).toEqual(Some(12));
});

test('testing `xor` method', () => {
  let val1 = Some(1);
  let val2 = None<number>();
  expect(val1.xor(val2)).toEqual(Some(1));

  val1 = None();
  val2 = Some(2);
  expect(val1.xor(val2)).toEqual(Some(2));

  val1 = Some(3);
  val2 = Some(4);
  expect(val1.xor(val2)).toEqual(None());
  
  val1 = None();
  val2 = None();
  expect(val1.xor(val2)).toEqual(None());
})
