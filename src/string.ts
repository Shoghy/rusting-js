import { panic } from "./panic";

const text_encoder = new TextEncoder();
const text_decoder = new TextDecoder();

const vec_symbol = Symbol("vec");

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
          panic("`arr_like` contiene valores que no son `string`");
        }
        bytes.push(...text_encoder.encode(val));
      }
    }

    const self = new RString();
    self[vec_symbol].buffer.resize(bytes.length);
    self[vec_symbol].set(bytes);

    return self;
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
