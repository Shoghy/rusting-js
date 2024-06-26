import { Err, Ok, type Result } from "./result";

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