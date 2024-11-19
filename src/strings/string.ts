import { panic } from "../panic.ts";
import { Err, Ok, Result } from "../enums/result.ts";
import {
  FromUtf8Error,
  run_utf8_validation,
  string_to_utf8,
  utf8_char_width,
  utf8_to_string,
} from "./utils.ts";
import { Char } from "./char.ts";

const vec_symbol = Symbol("vec");
const buffer_symbol = Symbol("buffer");

export class RString {
  private [vec_symbol]: Uint8Array;
  private [buffer_symbol]: ArrayBuffer;

  constructor() {
    this[buffer_symbol] = new ArrayBuffer(0, {
      maxByteLength: Math.pow(2, 31) - 1,
    });
    this[vec_symbol] = new Uint8Array(this[buffer_symbol]);
  }

  static from(arr_like: ArrayLike<string>) {
    const bytes: number[] = [];

    if (typeof arr_like === "string") {
      bytes.push(...string_to_utf8(arr_like));
    } else {
      for (let i = 0; i < arr_like.length; ++i) {
        const val = arr_like[i];

        if (typeof val !== "string") {
          panic("`arr_like` contains values that are not of type `string`");
        }
        bytes.push(...string_to_utf8(val));
      }
    }

    const self = new RString();
    self[buffer_symbol].resize(bytes.length);
    self[vec_symbol].set(bytes);

    return self;
  }

  static from_utf8(vec: ArrayLike<number>): Result<RString, FromUtf8Error> {
    return run_utf8_validation(vec).match({
      Err: (e) => Err(new FromUtf8Error(vec, e)),
      Ok: () => {
        const self = new RString();
        self[buffer_symbol].resize(vec.length);
        self[vec_symbol].set(vec);

        return Ok(self);
      },
    });
  }

  len(): number {
    return this[vec_symbol].length;
  }

  toString(): string {
    return utf8_to_string(this[vec_symbol]);
  }

  push_str(str: ArrayLike<string> | RString): void {
    if (!(str instanceof RString)) {
      str = RString.from(str);
    }

    const prev_length = this[vec_symbol].length;
    this[buffer_symbol].resize(prev_length + str.len());
    this[vec_symbol].set(str[vec_symbol], prev_length);
  }

  as_bytes(): Uint8Array {
    return this[vec_symbol].slice();
  }

  clear() {
    this[buffer_symbol].resize(0);
  }

  is_empty() {
    return this[vec_symbol].length === 0;
  }

  capacity() {
    return this[vec_symbol].byteLength;
  }

  chars() {
    const chars: Char[] = [];

    for (let i = 0; i < this[vec_symbol].length; ++i) {
      const first_byte = this[vec_symbol][i];
      const final_byte_index = utf8_char_width(first_byte) + i;
      const bytes: number[] = [];

      bytes.push(...this[vec_symbol].slice(i, final_byte_index));
      i = final_byte_index - 1;

      const char = Char.from_utf8(bytes).expect(
        "The bytes are separated before being sent",
      );
      chars.push(char);
    }

    return chars;
  }
}
