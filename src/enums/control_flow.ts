import { panic } from "../panic.ts";
import type { TryStatic } from "../traits/try_trait.ts";
import { StaticImplements } from "../utils.ts";
import { EnumClass } from "./enum.ts";
import { None, type Option, Some } from "./option.ts";

@StaticImplements<TryStatic<unknown, ControlFlow<unknown, unknown>>>()
export class ControlFlow<B, C> extends EnumClass<{ Break: B; Continue: C }> {
  // biome-ignore lint/correctness/noUnusedFunctionParameters: on extend avoid a weird variable name
  override isValidTypeValue(type: "Break" | "Continue", value: B | C): boolean {
    // biome-ignore lint/nursery/noUnnecessaryConditions: for ts is unreachable code, but this is a validation
    switch (type) {
      case "Break":
      case "Continue":
        return true;
    }
    return false;
  }

  static fromOutput<SB, SC>(output: SC): ControlFlow<SB, SC> {
    return ControlFlow.Continue(output);
  }

  branch(): ControlFlow<ControlFlow<B, C>, C> {
    return this.match({
      Continue: (c) => ControlFlow.Continue(c),
      Break: (b) => ControlFlow.Break(ControlFlow.Break(b)),
    });
  }

  static Continue<SB, SC>(value: SC): ControlFlow<SB, SC> {
    return new ControlFlow<SB, SC>("Continue", value);
  }

  static Break<SB, SC>(value: SB): ControlFlow<SB, SC> {
    return new ControlFlow<SB, SC>("Break", value);
  }

  isContinue(): boolean {
    return this.is("Continue");
  }

  isBreak(): boolean {
    return this.is("Break");
  }

  unwrapContinue(): C {
    return this.match({
      Continue: (c) => c,
      Break: () => panic("Called `unwrapContinue` method on a `Break`"),
    });
  }

  unwrapBreak(): B {
    return this.match({
      Continue: () => panic("Called `unwrapBreak` method on a `Continue`"),
      Break: (b) => b,
    });
  }

  breakValue(): Option<B> {
    return this.match({
      Continue: () => None(),
      Break: (b) => Some(b),
    });
  }

  mapBreak<T>(f: (b: B) => T): ControlFlow<T, C> {
    return this.match({
      Continue: (c) => ControlFlow.Continue(c),
      Break: (b) => ControlFlow.Break(f(b)),
    });
  }

  continueValue(): Option<C> {
    return this.match({
      Continue: (c) => Some(c),
      Break: () => None(),
    });
  }

  mapContinue<T>(f: (b: C) => T): ControlFlow<B, T> {
    return this.match({
      Continue: (c) => ControlFlow.Continue(f(c)),
      Break: (b) => ControlFlow.Break(b),
    });
  }
}
