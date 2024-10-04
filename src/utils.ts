export function StaticImplements<T>() {
  return <U extends T>(constructor: U) => { constructor; };
}

export function CloneValue<T>(obj: T): T {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }

  if (!Array.isArray(obj)) {
    return Object.assign(Object.create(Object.getPrototypeOf(obj)), obj);
  }

  const arrClone: unknown[] = [];
  const checkedObjs: object[] = [obj];
  const clonedObjs: object[] = [arrClone];

  function RecursiveChecker(value: unknown): unknown {
    if (typeof value !== "object") {
      return value;
    }

    const index = checkedObjs.indexOf(value as object);
    if (index > -1) {
      return clonedObjs[index];
    }

    checkedObjs.push(value as object);
    if (!Array.isArray(value)) {
      const clone = Object.assign(Object.create(Object.getPrototypeOf(value)), value);
      clonedObjs.push(clone);
      return clone;
    }

    const arrClone: unknown[] = [];

    for (const val of value) {
      arrClone.push(
        RecursiveChecker(val),
      );
    }

    clonedObjs.push(arrClone);
    return arrClone;
  }

  for (const val of obj) {
    arrClone.push(
      RecursiveChecker(val),
    );
  }

  return arrClone as T;
}

interface DeferObject {
  [Symbol.dispose](): void;
  [Symbol.asyncDispose](): Promise<void>;
  resolve(): Promise<void>;
}
/**
 * The `func` parameter is executed when the
 * function that called `defer` returns
 * or throw an error.
 * 
 * To use it you just need to create a dummy
 * variable with the `using` keyword.
 * ```ts
 * function example() {
 *   using _d1 = defer(() => {
 *     console.log("AEUGH");
 *   });
 * 
 *   console.log("Hello young lady");
 * }
 * 
 * example();
 * //Hello young lady
 * //AEUGH
 * ```
 * 
 * If your current enviroment doesn't support the `using` keyword
 * you can use the method `resolve` from the returned value.
 * 
 * ```ts
 * function exemple() {
 *   const d1 = defer(() => {
 *     console.log("Sorry the machine isn't working.");
 *   });
 * 
 *   console.log("I will like an Ice Cream.");
 *   d1.resolve();
 * }
 * 
 * exemple();
 * //I will like an Ice Cream.
 * //Sorry the machine isn't working.
 * ```
 */
export function defer(func: () => unknown): DeferObject {
  return {
    [Symbol.dispose]() {
      func();
    },

    async [Symbol.asyncDispose]() {
      await func();
    },

    async resolve() {
      const value = func();
      if (value instanceof Promise) {
        await value;
      }
    },
  };
}
