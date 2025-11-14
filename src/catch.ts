import { Err, Ok, type Result } from "./enums/result.ts";

/**
 * The `func` parameter may panic, if it does, the error will be caught and wrapped in a `Err`,
 * if it runs without any panics the return value of `func` will be wrapped in a `Ok`.
 */
export async function catchUnwindAsync<T, E = Error>(
  func: () => PromiseLike<T>,
): Promise<Result<Awaited<T>, E>> {
  try {
    return Ok(await func());
  } catch (e) {
    return Err(e as E);
  }
}

/**
 * The `func` parameter may panic, if it does, the error will be caught and wrapped in a `Err`,
 * if it runs without any panics the return value of `func` will be wrapped in a `Ok`.
 */
export function catchUnwind<T, E = Error>(func: () => T): Result<T, E> {
  try {
    return Ok(func());
  } catch (e) {
    return Err(e as E);
  }
}
