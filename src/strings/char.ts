import { None, Option, Some } from "../enums/option";
import {
  runUtf8Validation,
  utf8CharWidth,
  stringToUtf8,
  utf8ToString,
  splitUtf8Chars,
} from "./utils";

export class Char {
  #bytes: Uint8Array;

  private constructor(bytes: ArrayLike<number>) {
    this.#bytes = new Uint8Array(bytes);
  }

  static fromUtf8(bytes: Uint8Array): Option<Char> {
    if (bytes.length === 0) return None();

    const first = bytes[0];
    const length = utf8CharWidth(first);

    if (bytes.length !== length) {
      return None();
    }

    return runUtf8Validation(bytes).match({
      Err: () => None(),
      Ok: () => Some(new Char(bytes)),
    });
  }

  static fromStr(str: string): Char[] {
    const bytes = new Uint8Array(stringToUtf8(str));
    const uChars = splitUtf8Chars(bytes);
    const chars: Char[] = [];

    for (let i = 0; i < uChars.length; ++i) {
      chars.push(new Char(uChars[i]));
    }

    return chars;
  }

  toString(): string {
    return utf8ToString(this.#bytes);
  }
}
