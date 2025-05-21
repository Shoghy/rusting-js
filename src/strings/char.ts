import { Err, Ok, Result } from "../enums/result";
import { Iter } from "../iterators/iter";
import { utf8CharWidth, utf8ToUnicode } from "./utils";

export enum CharFromError {
  EmptyValue,
  MoreThanOneChar,
  InvalidUtf8,
}

function* splitString(str: string) {
  for (const c of str) {
    yield c;
  }
}

export class Char {
  #unicode: number;

  private constructor(unicode: number) {
    this.#unicode = unicode;
  }

  asNumber() {
    return this.#unicode;
  }

  static fromUtf8(bytes: Uint8Array): Result<Char, CharFromError> {
    if (bytes.length === 0) return Err(CharFromError.EmptyValue);

    const first = bytes[0];
    const length = utf8CharWidth(first);

    if (bytes.length !== length) {
      return Err(CharFromError.MoreThanOneChar);
    }

    return utf8ToUnicode(bytes)
      .map((unicodeArr) => new Char(unicodeArr[0]))
      .mapErr(() => CharFromError.InvalidUtf8);
  }

  static fromCharStr(charStr: string): Result<Char, CharFromError> {
    if (charStr.length === 0) return Err(CharFromError.EmptyValue);
    let first = true;

    let char: string;
    for (const c of charStr) {
      if (!first) {
        return Err(CharFromError.MoreThanOneChar);
      } else {
        first = false;
      }
      char = c;
    }

    return Ok(new Char(char!.codePointAt(0)!));
  }

  static fromStr(str: string) {
    return new Iter(splitString(str).map((c) => new Char(c.codePointAt(0)!)));
  }

  toString(): string {
    return String.fromCodePoint(this.#unicode);
  }
}
