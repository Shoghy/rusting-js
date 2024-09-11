import { panic } from "./panic";
import { None, Option, Some } from "./enums/option";
import { Err, Ok, Result } from "./enums/result";

const text_encoder = new TextEncoder();
const text_decoder = new TextDecoder();

const vec_symbol = Symbol("vec");

class Utf8Error {
  valid_up_to: number;
  error_len: Option<number>;

  constructor(valid_up_to: number, error_len: Option<number>) {
    this.valid_up_to = valid_up_to;
    this.error_len = error_len;
  }
}

class FromUtf8Error {
  bytes: ArrayLike<number>;
  error: Utf8Error;

  constructor(bytes: ArrayLike<number>, error: Utf8Error) {
    this.bytes = bytes;
    this.error = error;
  }
}

export function utf8_char_width(b: number): 0 | 1 | 2 | 3 | 4 {
  if (b < 0) {
    return 0;
  }

  if (isNaN(b)) {
    return 0;
  }

  if (b < 128) {
    return 1;
  }

  b = b >> 3;
  if (b === 0b11110) {
    return 4;
  }

  b = b >> 1;
  if (b === 0b1110) {
    return 3;
  }

  b = b >> 1;
  if (b === 0b110) {
    return 2;
  }

  return 0;
}

export function run_utf8_validation(v: ArrayLike<number>): Result<void, Utf8Error> {
  let index = 0;
  let old_offset = 0;
  const len = v.length;

  function next() {
    index += 1;

    if (index >= len) {
      throw None();
    } else if (v[index] < 0) {
      throw Some(1);
    } else if (isNaN(v[index])) {
      throw None();
    }

    return v[index];
  }

  try {
    for (; index < len; ++index) {
      const first = v[index];

      if (first > 255) {
        throw None();
      } else if (first < 0) {
        throw None();
      } else if (isNaN(first)) {
        throw None();
      }

      if (first < 128) {
        continue;
      }

      const w = utf8_char_width(first);

      switch (w) {
        case 2: {
          const val = next();
          if (val < 0x80 || val > 0xBF) {
            throw Some(1);
          }
          break;
        }
        case 3: {
          let val = next();
          if (
            (first === 0xE0 && val >= 0xA0 && val <= 0xBF)
            || (first >= 0xE1 && first <= 0xEC && val >= 0x80 && val <= 0xBF)
            || (first === 0xED && val >= 0x80 && val <= 0x9F)
            || (first >= 0xEE && first <= 0xEF && val >= 0x80 && val <= 0xBF)
          ) {
            val = next();
            if (val < 0x80 || val > 0xBF) {
              throw Some(2);
            }
            break;
          } else {
            throw Some(1);
          }
        }
        case 4: {
          let val = next();
          if (
            (first === 0xF0 && val >= 0x90 && val <= 0xBF)
            || (first >= 0xF1 && first <= 0xF3 && val >= 0x80 && val <= 0xBF)
            || (first === 0xF4 && val >= 0x80 && val <= 0x8F)
          ) {
            val = next();
            if (val < 0x80 || val > 0xBF) {
              throw Some(2);
            }
            val = next();
            if (val < 0x80 || val > 0xBF) {
              throw Some(3);
            }
            break;
          }
          throw Some(1);
        }
        default: {
          throw Some(1);
        }
      }

      old_offset = index;
    }
  } catch (e) {
    return Err(new Utf8Error(old_offset, e as Option<number>));
  }

  return Ok(undefined as void);
}

export class RString {
  private [vec_symbol]: Uint8Array & { buffer: ArrayBuffer };

  constructor() {
    const buffer = new ArrayBuffer(0, { maxByteLength: Math.pow(2, 31) - 1 });
    this[vec_symbol] = new Uint8Array(buffer) as Uint8Array & { buffer: ArrayBuffer };
  }

  static from(arr_like: ArrayLike<string>) {
    const bytes: number[] = [];

    if (typeof arr_like === "string") {
      bytes.push(...text_encoder.encode(arr_like));
    } else {
      for (let i = 0; i < arr_like.length; ++i) {
        const val = arr_like[i];

        if (typeof val !== "string") {
          panic("`arr_like` contains values that are not of type `string`");
        }
        bytes.push(...text_encoder.encode(val));
      }
    }

    const self = new RString();
    self[vec_symbol].buffer.resize(bytes.length);
    self[vec_symbol].set(bytes);

    return self;
  }

  static from_utf8(vec: ArrayLike<number>): Result<RString, FromUtf8Error> {
    return run_utf8_validation(vec).match({
      Err: (e) => Err(new FromUtf8Error(vec, e)),
      Ok: () => {
        const self = new RString();
        self[vec_symbol].buffer.resize(vec.length);
        self[vec_symbol].set(vec);

        return Ok(self);
      },
    });
  }

  len(): number {
    return this[vec_symbol].length;
  }

  toString(): string {
    return text_decoder.decode(this[vec_symbol]);
  }

  push_str(str: ArrayLike<string> | RString): void {
    if (!(str instanceof RString)) {
      str = RString.from(str);
    }

    const vec = this[vec_symbol];
    const prev_length = vec.length;
    vec.buffer.resize(prev_length + str.len());
    vec.set(str[vec_symbol], prev_length);
  }

  as_bytes(): Uint8Array {
    return this[vec_symbol].slice();
  }

  clear() {
    const vec = this[vec_symbol];
    vec.buffer.resize(0);
  }

  is_empty() {
    return this[vec_symbol].length === 0;
  }

  capacity() {
    return this[vec_symbol].byteLength;
  }
}
