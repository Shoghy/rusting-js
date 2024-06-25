export function unreachable(message?: string): never {
  throw new Error(message, {
    cause: "Code marked as unreachable was executed"
  });
}

export function panic(message?: string): never {
  throw new Error(message);
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