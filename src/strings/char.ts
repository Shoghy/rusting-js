import { Err, Ok, Result } from "../enums/result";
import { utf8CharWidth, utf8ToUnicode } from "./utils";

export enum CharFromError {
  EmptyValue,
  MoreThanOneChar,
  InvalidUtf8,
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

  static fromStr(str: string): Result<Char, CharFromError> {
    if (str.length === 0) return Err(CharFromError.EmptyValue);
    let first = true;

    let char: string;
    for (const c of str) {
      if (!first) {
        return Err(CharFromError.MoreThanOneChar);
      } else {
        first = false;
      }
      char = c;
    }

    return Ok(new Char(char!.codePointAt(0)!));
  }

  toString(): string {
    return String.fromCodePoint(this.#unicode);
  }
}
