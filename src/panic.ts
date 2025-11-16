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
