import { Err, Ok, type Result } from "./enums/result";

/**
 * Use it to mark the code as unreachable when the compiler is
 * not able to determinate if the code is unreachable
 * @throws {Error}
 * @param message 
 * Explain why do you think this code is unreachable
 */
export function unreachable(message?: string): never {
  throw new Error(message, {
    cause: "Code marked as unreachable was executed"
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
    cause: "Panic function call"
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
    cause: "Unfinished code was executed"
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
    cause: "Unimplemented code was executed"
  });
}

async function catch_async<T extends Promise<unknown>, E>(promise: T): Promise<Result<Awaited<T>, E>> {
  try {
    return Ok(await promise);
  } catch (e) {
    return Err(e as E);
  }
}

/**
 * The `func` parameter may panic, if it does, the error will be catched and wrapped in a `Err`,
 * if it runs without any panics the return value of `func` will be wrapped in a `Ok`.
 */
export function catch_unwind<T, E = Error>(func: T extends Promise<unknown> ? () => T : never): Promise<Result<Awaited<T>, E>>;
export function catch_unwind<T, E = Error>(func: () => T): Result<T, E>;
export function catch_unwind<T, E = Error>(func: () => T): Result<T, E> | Promise<Result<Awaited<T>, E>> {
  try {
    const value = func();
    if (value instanceof Promise) {
      return catch_async<Promise<T>, E>(value);
    }
    return Ok(value);
  } catch (e) {
    return Err(e as E);
  }
}
