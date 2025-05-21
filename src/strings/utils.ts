import { Err, Ok, type Result } from "../enums/result.ts";
import { None, type Option, Some } from "../enums/option.ts";
import { catchUnwind } from "../panic.ts";

/**
 * @author https://stackoverflow.com/a/18729931
 */
export function stringToUtf8(str: string) {
  const utf8: number[] = [];
  for (let i = 0; i < str.length; i++) {
    let charCode = str.charCodeAt(i);
    if (charCode < 0x80) utf8.push(charCode);
    else if (charCode < 0x800) {
      utf8.push(0xc0 | (charCode >> 6), 0x80 | (charCode & 0x3f));
    } else if (charCode < 0xd800 || charCode >= 0xe000) {
      utf8.push(
        0xe0 | (charCode >> 12),
        0x80 | ((charCode >> 6) & 0x3f),
        0x80 | (charCode & 0x3f),
      );
    }
    // surrogate pair
    else {
      i++;
      // UTF-16 encodes 0x10000-0x10FFFF by
      // subtracting 0x10000 and splitting the
      // 20 bits of 0x0-0xFFFFF into two halves
      charCode =
        0x10000 + (((charCode & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
      utf8.push(
        0xf0 | (charCode >> 18),
        0x80 | ((charCode >> 12) & 0x3f),
        0x80 | ((charCode >> 6) & 0x3f),
        0x80 | (charCode & 0x3f),
      );
    }
  }

  return utf8;
}

/**
 * @author https://stackoverflow.com/a/42453251
 */
export function utf8ToString(array: Uint8Array) {
  let c: number, char2: number, char3: number, char4: number;
  let out = "";
  const len = array.length;
  let i = 0;
  while (i < len) {
    c = array[i++];
    switch (c >> 4) {
      case 0:
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
        // 0xxxxxxx
        out += String.fromCharCode(c);
        break;
      case 12:
      case 13:
        // 110x xxxx   10xx xxxx
        char2 = array[i++];
        out += String.fromCharCode(((c & 0x1f) << 6) | (char2 & 0x3f));
        break;
      case 14:
        // 1110 xxxx  10xx xxxx  10xx xxxx
        char2 = array[i++];
        char3 = array[i++];
        out += String.fromCharCode(
          ((c & 0x0f) << 12) | ((char2 & 0x3f) << 6) | ((char3 & 0x3f) << 0),
        );
        break;
      case 15:
        // 1111 0xxx 10xx xxxx 10xx xxxx 10xx xxxx
        char2 = array[i++];
        char3 = array[i++];
        char4 = array[i++];
        out += String.fromCodePoint(
          ((c & 0x07) << 18) |
            ((char2 & 0x3f) << 12) |
            ((char3 & 0x3f) << 6) |
            (char4 & 0x3f),
        );

        break;
    }
  }
  return out;
}

export function utf8CharWidth(b: number): 0 | 1 | 2 | 3 | 4 {
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

export function utf8ToUnicode(bytes: Uint8Array): Result<number[], number> {
  const unicodeArr: number[] = [];

  for (let i = 0; i < bytes.length; ++i) {
    const firstByte = bytes[i];

    if (firstByte < 128) {
      unicodeArr.push(firstByte);
      continue;
    }

    const charLength = utf8CharWidth(firstByte);

    if (charLength === 0 || i + charLength > bytes.length) {
      return Err(i);
    }

    let unicode = firstByte & ((1 << (8 - charLength - 1)) - 1);

    for (let j = 1; j < charLength; ++j) {
      const b = bytes[i + j];
      if ((b & 0b1100_0000) !== 0b1000_0000) {
        return Err(i);
      }
      unicode <<= 6;
      unicode += b & 0b0011_1111;
    }

    i += charLength - 1;

    unicodeArr.push(unicode);
  }

  return Ok(unicodeArr);
}

export class Utf8Error {
  validUpTo: number;
  errorLen: Option<number>;

  constructor(validUpTo: number, errorLen: Option<number>) {
    this.validUpTo = validUpTo;
    this.errorLen = errorLen;
  }
}

export function runUtf8Validation(bytes: Uint8Array): Result<void, Utf8Error> {
  let index = 0;
  let oldOffset = 0;
  const len = bytes.length;

  function next() {
    index += 1;

    if (index >= len) {
      throw None();
    } else if (bytes[index] < 0) {
      throw Some(1);
    } else if (isNaN(bytes[index])) {
      throw None();
    }

    return bytes[index];
  }

  const result = catchUnwind<void, Option<number>>(() => {
    for (; index < len; ++index) {
      const firstByte = bytes[index];

      if (firstByte < 128) {
        continue;
      }

      const charWidth = utf8CharWidth(firstByte);

      switch (charWidth) {
        case 2: {
          const val = next();
          if (val < 0x80 || val > 0xbf) {
            throw Some(1);
          }
          break;
        }
        case 3: {
          let val = next();
          if (
            (firstByte === 0xe0 && val >= 0xa0 && val <= 0xbf) ||
            (firstByte >= 0xe1 &&
              firstByte <= 0xec &&
              val >= 0x80 &&
              val <= 0xbf) ||
            (firstByte === 0xed && val >= 0x80 && val <= 0x9f) ||
            (firstByte >= 0xee &&
              firstByte <= 0xef &&
              val >= 0x80 &&
              val <= 0xbf)
          ) {
            val = next();
            if (val < 0x80 || val > 0xbf) {
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
            (firstByte === 0xf0 && val >= 0x90 && val <= 0xbf) ||
            (firstByte >= 0xf1 &&
              firstByte <= 0xf3 &&
              val >= 0x80 &&
              val <= 0xbf) ||
            (firstByte === 0xf4 && val >= 0x80 && val <= 0x8f)
          ) {
            val = next();
            if (val < 0x80 || val > 0xbf) {
              throw Some(2);
            }
            val = next();
            if (val < 0x80 || val > 0xbf) {
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

      oldOffset = index;
    }
  });

  return result.mapErr((error) => new Utf8Error(oldOffset, error));
}

export function* splitUtf8Chars(vec: Uint8Array) {
  for (let i = 0; i < vec.length; ++i) {
    const firstByte = vec[i];
    const charLength = utf8CharWidth(firstByte);

    yield new Uint8Array(vec.buffer, i, charLength);

    i += charLength - 1;
  }
}

export class FromUtf8Error {
  bytes: ArrayLike<number>;
  error: Utf8Error;

  constructor(bytes: ArrayLike<number>, error: Utf8Error) {
    this.bytes = bytes;
    this.error = error;
  }
}
