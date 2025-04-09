import { Err, Ok, type Result } from "./enums/result.ts";

/**
 * Use it to mark the code as unreachable when the compiler is
 * not able to determinate if the code is unreachable
 * @throws {Error}
 * @param message
 * Explain why do you think this code is unreachable
 */
export function unreachable(message?: string): never {
  throw new Error(message, {
    cause: "Code marked as unreachable was executed",
  });
}

/**
 * Make the program panics
 * @throws {Error}
 * @param message
 * Explain why the program panicked
 */
export function panic(message?: string): never {
  throw new Error(message, {
    cause: "Panic function call",
  });
}

/**
 * Marks the code as in progress
 * @throws {Error}
 * @param message
 * Explain what needs to be done
 */
export function todo(message: string): never {
  throw new Error(message, {
    cause: "Unfinished code was executed",
  });
}

/**
 * Marks the code as unimplemented
 * @throws {Error}
 * @param message
 * Explain what needs to be implemented
 */
export function unimplemented(message?: string): never {
  throw new Error(message, {
    cause: "Unimplemented code was executed",
  });
}

/**
 * The `func` parameter may panic, if it does, the error will be caught and wrapped in a `Err`,
 * if it runs without any panics the return value of `func` will be wrapped in a `Ok`.
 */
export async function catch_unwind_async<T extends PromiseLike<unknown>, E>(
  func: () => T,
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
export function catch_unwind<T, E = Error>(func: () => T): Result<T, E> {
  try {
    return Ok(func());
  } catch (e) {
    return Err(e as E);
  }
}
