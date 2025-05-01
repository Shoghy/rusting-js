import { None, Option, Some } from "../enums/option";
import {
  runUtf8Validation,
  utf8CharWidth,
  stringToUtf8,
  utf8ToString,
} from "./utils";

export class Char {
  #bytes: Uint8Array;

  private constructor(bytes: ArrayLike<number>) {
    this.#bytes = new Uint8Array(bytes);
  }

  static fromUtf8(bytes: ArrayLike<number>): Option<Char> {
    if (bytes.length === 0) return None();

    const first = bytes[0];
    const length = utf8CharWidth(first);

    if (bytes.length !== length) {
      return None();
    }

    return runUtf8Validation(bytes).match({
      Err: () => None(),
      Ok: () => Some(new this(bytes)),
    });
  }

  /**
   * @param {string} str Must be a char long, if not it will return `None`
   */
  static fromStr(str: string): Option<Char> {
    if (str.length === 0) return None();

    const bytes = stringToUtf8(str);
    const first = bytes[0];
    const length = utf8CharWidth(first);

    if (length !== bytes.length) {
      return None();
    }

    return Some(new this(bytes));
  }

  toString(): string {
    return utf8ToString(this.#bytes);
  }
}
