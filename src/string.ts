import { panic } from "./panic";

const text_encoder = new TextEncoder();
const text_decoder = new TextDecoder();

const vec_symbol = Symbol("vec");

export class RString {
  private [vec_symbol]: Uint8Array & {buffer: ArrayBuffer};

  constructor() {
    const buffer = new ArrayBuffer(0, {maxByteLength: Math.pow(2, 31) - 1});
    this[vec_symbol] = new Uint8Array(buffer) as Uint8Array & {buffer: ArrayBuffer};
  }

  static from<T extends ArrayLike<string>>(arr_like: T) {
    const bytes: number[] = [];
    for (let i = 0; i < arr_like.length; ++i) {
      const val = arr_like[i];

      if (typeof val !== "string") {
        panic("`arr_like` contiene valores que no son `string`");
      }
      bytes.push(...text_encoder.encode(val));
    }

    const self = new RString();
    self[vec_symbol].buffer.resize(bytes.length);
    self[vec_symbol].set(bytes);

    return self;
  }

  len(): number{
    return this[vec_symbol].length;
  }

  toString(){
    return text_decoder.decode(this[vec_symbol]);
  }
}