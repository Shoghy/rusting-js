export function staticImplements<T>() {
  return <U extends T>(constructor: U) => { constructor; };
}

export function CloneValue<T>(obj: T): T {
  if (typeof obj !== "object") {
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

/**
 * The `func` parameter is executed when the
 * function that called `defer` returns
 * or throw an error.
 * 
 * To use it you just need to create a dummy
 * variable with the `using` keyword.
 * @example
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
 */
export function defer(func: () => unknown) {
  return {
    [Symbol.dispose]() {
      func();
    },
  };
}
