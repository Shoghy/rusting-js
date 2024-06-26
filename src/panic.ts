import { Err, Ok, type Result } from "./result";

export function unreachable(message?: string): never {
  throw new Error(message, {
    cause: "Code marked as unreachable was executed"
  });
}

export function panic(message?: string): never {
  throw new Error(message, {
    cause: "Panic function call"
  });
}

export function todo(message: string): never {
  throw new Error(message, {
    cause: "Unfinished code was executed"
  });
}

export function unimplemented(message?: string): never {
  throw new Error(message, {
    cause: "Unimplemented code was executed"
  });
}

async function catch_async<T, E>(promise: Promise<T>): Promise<Result<T, E>>{
  try{
    return Ok(await promise);
  }catch(e){
    return Err(e as E);
  }
}

/**
 * The `func` parameter may panic, if it does, the error will be catched and wrapped in a `Err`,
 * if it runs without any panics the return value of `func` will be wrapped in a `Ok`.
 */
export function catch_unwind<T, E>(func: T extends Promise<unknown> ? never : () => T): Result<T, E>;
export function catch_unwind<T, E>(func: T extends Promise<unknown> ? () => T : never): Promise<Result<Awaited<T>, E>>;
export function catch_unwind<T, E>(func: () => T): Result<T, E> | Promise<Result<T, E>>{
  try{
    const value = func();
    if(value instanceof Promise){
      return catch_async<T, E>(value);
    }
    return Ok(value);
  }catch(e){
    return Err(e as E);
  }
}