import { None, Option, Some } from "../enums/option";
import {
  run_utf8_validation,
  utf8_char_width,
  string_to_utf8,
  utf8_to_string,
} from "./utils";

export class Char {
  #bytes: Uint8Array;

  private constructor(bytes: ArrayLike<number>) {
    this.#bytes = new Uint8Array(bytes);
  }

  static from_utf8(bytes: ArrayLike<number>): Option<Char> {
    if (bytes.length === 0) return None();

    const first = bytes[0];
    const length = utf8_char_width(first);

    if (bytes.length !== length) {
      return None();
    }

    return run_utf8_validation(bytes).match({
      Err: () => None(),
      Ok: () => Some(new this(bytes)),
    });
  }

  /**
   * @param {string} str Must be a char long, if not it will return `None`
   */
  static from_str(str: string): Option<Char> {
    if (str.length === 0) return None();

    const bytes = string_to_utf8(str);
    const first = bytes[0];
    const length = utf8_char_width(first);

    if (length !== bytes.length) {
      return None();
    }

    return Some(new this(bytes));
  }

  toString(): string {
    return utf8_to_string(this.#bytes);
  }
}
