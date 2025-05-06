import { Err, Ok, Result } from "../enums/result.ts";
import {
  FromUtf8Error,
  runUtf8Validation,
  stringToUtf8,
  splitUtf8Chars,
  utf8ToString,
} from "./utils.ts";
import { Char } from "./char.ts";

export class RString {
  #vec: Uint8Array;

  constructor() {
    this.#vec = new Uint8Array();
  }

  static fromStr(str: string) {
    const bytes: number[] = [];

    bytes.push(...stringToUtf8(str));

    const self = new RString();
    self.#vec = new Uint8Array(bytes);

    return self;
  }

  static fromUtf8(vec: Uint8Array): Result<RString, FromUtf8Error> {
    return runUtf8Validation(vec).match({
      Err: (e) => Err(new FromUtf8Error(vec, e)),
      Ok: () => {
        const self = new RString();
        self.#vec = new Uint8Array(vec);

        return Ok(self);
      },
    });
  }

  len(): number {
    return this.#vec.length;
  }

  toString(): string {
    return utf8ToString(this.#vec);
  }

  pushStr(str: string | RString): void {
    let otherVec: ArrayLike<number>;
    if (str instanceof RString) {
      otherVec = str.#vec;
    } else {
      otherVec = stringToUtf8(str);
    }

    const newVec = new Uint8Array(this.len() + otherVec.length);
    newVec.set(this.#vec);
    newVec.set(otherVec, this.len());

    this.#vec = newVec;
  }

  asBytes(): Uint8Array {
    return this.#vec.slice();
  }

  clear() {
    this.#vec = new Uint8Array(0);
  }

  isEmpty() {
    return this.#vec.length === 0;
  }

  capacity() {
    return this.#vec.byteLength;
  }

  chars() {
    const chars: Char[] = [];
    const uChars = splitUtf8Chars(this.#vec);

    for (let i = 0; i < uChars.length; ++i) {
      chars.push(
        Char.fromUtf8(uChars[i]).expect(`Invalid UTF-8 sequence ${uChars[i]}`),
      );
    }

    return chars;
  }
}
