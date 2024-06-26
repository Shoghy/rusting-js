// I am done writing literals XDXD

export function RandomInt(minInclusive: number, maxInclusive: number): number {
  return Math.floor(
    Math.random() * (maxInclusive - minInclusive + 1)
  ) + minInclusive;
}

const CHARACTERS = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ abcdefghijklmnñopqrstuvwxyz\t0123456789_-¡!¿?(){}[]=+-*/%&|`´\"'^~\\<>あいうえおん$￥€";
export function RandomString(length: number): string {
  let result = "";
  const char_length = CHARACTERS.length-1;
  for(let i = 0; i < length; ++i){
    result += CHARACTERS[RandomInt(0, char_length)];
  }
  return result;
}

export function TrueRandomString(length: number): string {
  let result = "";
  for(let i = 0; i < length; ++i){
    result += String.fromCharCode(RandomInt(0, 65535));
  }
  return result;
}
