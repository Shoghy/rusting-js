import { panic } from "../panic";
import { Err, Ok, Result } from "../enums/result";
import { run_utf8_validation, string_to_utf8, utf8_to_string, Utf8Error } from "./utils";

const vec_symbol = Symbol("vec");

class FromUtf8Error {
  bytes: ArrayLike<number>;
  error: Utf8Error;

  constructor(bytes: ArrayLike<number>, error: Utf8Error) {
    this.bytes = bytes;
    this.error = error;
  }
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
    return utf8_to_string(this[vec_symbol]);
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
