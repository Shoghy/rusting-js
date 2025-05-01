import { panic } from "../panic.ts";
import { Err, Ok, Result } from "../enums/result.ts";
import {
  FromUtf8Error,
  runUtf8Validation,
  stringToUtf8,
  utf8CharWidth,
  utf8ToString,
} from "./utils.ts";
import { Char } from "./char.ts";

export class RString {
  #vec: Uint8Array;

  constructor() {
    this.#vec = new Uint8Array();
  }

  static from(arrLike: ArrayLike<string>) {
    const bytes: number[] = [];

    if (typeof arrLike === "string") {
      bytes.push(...stringToUtf8(arrLike));
    } else {
      for (let i = 0; i < arrLike.length; ++i) {
        const val = arrLike[i];

        if (typeof val !== "string") {
          panic("`arrLike` contains values that are not of type `string`");
        }
        bytes.push(...stringToUtf8(val));
      }
    }

    const self = new RString();
    self.#vec = new Uint8Array(bytes);

    return self;
  }

  static fromUtf8(vec: ArrayLike<number>): Result<RString, FromUtf8Error> {
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

  pushStr(str: ArrayLike<string> | RString): void {
    if (!(str instanceof RString)) {
      str = RString.from(str);
    }

    const newVec = new Uint8Array(this.len() + str.len());
    newVec.set(this.#vec);
    newVec.set(str.#vec, this.len());

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

    for (let i = 0; i < this.#vec.length; ++i) {
      const firstByte = this.#vec[i];
      const finalByteIndex = utf8CharWidth(firstByte) + i;
      const bytes: number[] = [];

      bytes.push(...this.#vec.slice(i, finalByteIndex));
      i = finalByteIndex - 1;

      const char = Char.fromUtf8(bytes).expect(
        `Invalid UTF-8 sequence at index ${i}`,
      );
      chars.push(char);
    }

    return chars;
  }
}
