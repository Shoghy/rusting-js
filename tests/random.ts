export function randomInt(minInclusive: number, maxInclusive: number): number {
  return (
    Math.floor(Math.random() * (maxInclusive - minInclusive + 1)) + minInclusive
  );
}

export function randomString(length: number): string {
  let result = "";
  for (let i = 0; i < length; ++i) {
    result += String.fromCharCode(randomInt(0, 65535));
  }
  return result;
}
