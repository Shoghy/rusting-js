import { Err, Ok, type Result } from "../enums/result.ts";
import { Iter } from "../iterators/iter.ts";
import type { IterMap } from "../iterators/iter_map.ts";
import { Char } from "./char.ts";
import {
  FromUtf8Error,
  runUtf8Validation,
  splitUtf8Chars,
  stringToUtf8,
  utf8ToString,
} from "./utils.ts";

export class RString {
  #bytes: Uint8Array;

  constructor() {
    this.#bytes = new Uint8Array();
  }

  static fromStr(str: string): RString {
    const bytes: number[] = [];

    bytes.push(...stringToUtf8(str));

    const self = new RString();
    self.#bytes = new Uint8Array(bytes);

    return self;
  }

  static fromUtf8(bytes: Uint8Array): Result<RString, FromUtf8Error> {
    return runUtf8Validation(bytes).match({
      Err: (e) => Err(new FromUtf8Error(bytes, e)),
      Ok: () => {
        const self = new RString();
        self.#bytes = new Uint8Array(bytes);

        return Ok(self);
      },
    });
  }

  len(): number {
    return this.#bytes.length;
  }

  toString(): string {
    return utf8ToString(this.#bytes);
  }

  pushStr(str: string | RString): void {
    let otherVec: ArrayLike<number>;
    if (str instanceof RString) {
      otherVec = str.#bytes;
    } else {
      otherVec = stringToUtf8(str);
    }

    const newVec = new Uint8Array(this.#bytes.length + otherVec.length);
    newVec.set(this.#bytes);
    newVec.set(otherVec, this.#bytes.length);

    this.#bytes = newVec;
  }

  asBytes(): Uint8Array {
    return this.#bytes.slice();
  }

  clear(): void {
    this.#bytes = new Uint8Array(0);
  }

  isEmpty(): boolean {
    return this.#bytes.length === 0;
  }

  capacity(): number {
    return this.#bytes.byteLength;
  }

  chars(): IterMap<Uint8Array<ArrayBufferLike>, Char> {
    return new Iter(splitUtf8Chars(this.#bytes)).map((bytes) =>
      Char.fromUtf8(bytes).expect("Invalid UTF-8"),
    );
  }
}
