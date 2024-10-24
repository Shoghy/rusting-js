import { Err, Ok, Result } from "../enums/result.ts";
import { None, Option, Some } from "../enums/option.ts";

/**
 * @author https://stackoverflow.com/a/18729931
 */
export function string_to_utf8(str: string) {
  const utf8: number[] = [];
  for (let i = 0; i < str.length; i++) {
    let charcode = str.charCodeAt(i);
    if (charcode < 0x80) utf8.push(charcode);
    else if (charcode < 0x800) {
      utf8.push(0xc0 | (charcode >> 6), 0x80 | (charcode & 0x3f));
    } else if (charcode < 0xd800 || charcode >= 0xe000) {
      utf8.push(
        0xe0 | (charcode >> 12),
        0x80 | ((charcode >> 6) & 0x3f),
        0x80 | (charcode & 0x3f),
      );
    }
    // surrogate pair
    else {
      i++;
      // UTF-16 encodes 0x10000-0x10FFFF by
      // subtracting 0x10000 and splitting the
      // 20 bits of 0x0-0xFFFFF into two halves
      charcode =
        0x10000 + (((charcode & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
      utf8.push(
        0xf0 | (charcode >> 18),
        0x80 | ((charcode >> 12) & 0x3f),
        0x80 | ((charcode >> 6) & 0x3f),
        0x80 | (charcode & 0x3f),
      );
    }
  }
  return utf8;
}

/**
 * @author https://stackoverflow.com/a/42453251
 */
export function utf8_to_string(array: ArrayLike<number>) {
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

export class Utf8Error {
  valid_up_to: number;
  error_len: Option<number>;

  constructor(valid_up_to: number, error_len: Option<number>) {
    this.valid_up_to = valid_up_to;
    this.error_len = error_len;
  }
}

export function run_utf8_validation(
  v: ArrayLike<number>,
): Result<void, Utf8Error> {
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
          if (val < 0x80 || val > 0xbf) {
            throw Some(1);
          }
          break;
        }
        case 3: {
          let val = next();
          if (
            (first === 0xe0 && val >= 0xa0 && val <= 0xbf) ||
            (first >= 0xe1 && first <= 0xec && val >= 0x80 && val <= 0xbf) ||
            (first === 0xed && val >= 0x80 && val <= 0x9f) ||
            (first >= 0xee && first <= 0xef && val >= 0x80 && val <= 0xbf)
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
            (first === 0xf0 && val >= 0x90 && val <= 0xbf) ||
            (first >= 0xf1 && first <= 0xf3 && val >= 0x80 && val <= 0xbf) ||
            (first === 0xf4 && val >= 0x80 && val <= 0x8f)
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

      old_offset = index;
    }
  } catch (e) {
    return Err(new Utf8Error(old_offset, e as Option<number>));
  }

  return Ok(undefined as void);
}
