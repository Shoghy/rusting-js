import { EnumClass, None, type Option, Some } from "../enums/index.ts";

export class MapLoopItem<T> extends EnumClass<{
  Collect: T;
  Omit: void;
  Stop: Option<T>;
}> {
  static Collect<ST>(value: ST): MapLoopItem<ST> {
    return new MapLoopItem("Collect", value);
  }

  static Omit<ST>(): MapLoopItem<ST> {
    return new MapLoopItem("Omit");
  }

  static Stop<ST>(): MapLoopItem<ST>;
  static Stop<ST>(value: ST): MapLoopItem<ST>;
  static Stop<ST>(...values: ST[]): MapLoopItem<ST> {
    if (values.length === 0) {
      return new MapLoopItem("Stop", None());
    }

    return new MapLoopItem("Stop", Some(values[0]));
  }
}

export function mapLoop<T, R>(
  iter: Iterable<T>,
  func: (item: T, index: number) => MapLoopItem<R>,
): R[] {
  const result: R[] = [];

  let i = 0;
  for (const item of iter) {
    const value = func(item, i);
    ++i;

    let shouldBreak = false;
    value.match({
      Collect(r) {
        result.push(r);
      },
      Omit() {},
      Stop(opt) {
        shouldBreak = true;
        opt.ifSome((r) => result.push(r));
      },
    });

    if (shouldBreak) {
      break;
    }
  }

  return result;
}
