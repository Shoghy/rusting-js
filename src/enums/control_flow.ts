import { Enum } from "./enum.ts";
import { panic } from "../panic.ts";
import type { TryStatic } from "../traits/try_trait.ts";
import { StaticImplements } from "../utils.ts";
import { Some, None, Option } from "./option.ts";

@StaticImplements<TryStatic<unknown, ControlFlow<unknown, unknown>>>()
export class ControlFlow<B, C> extends Enum<{ Continue: unknown, Break: unknown }>() {
  static from_output<B, C>(output: C): ControlFlow<B, C> {
    return ControlFlow.Continue(output);
  }

  branch(): ControlFlow<ControlFlow<B, C>, C> {
    return this.match({
      Continue: (c) => ControlFlow.Continue(c),
      Break: (b) => ControlFlow.Break(ControlFlow.Break(b)),
    });
  }

  static Continue<B, C>(value: C): ControlFlow<B, C> {
    return new ControlFlow("Continue", value);
  }

  static Break<B, C>(value: B): ControlFlow<B, C> {
    return new ControlFlow("Break", value);
  }

  match<T>(arms: { Continue: (value: C) => T; Break: (value: B) => T; }): T;
  match<T>(arms: { Continue?: ((value: C) => T); Break?: ((value: B) => T); }, def: () => T): T;
  match<T>(arms: { Continue?: ((value: C) => T); Break?: ((value: B) => T); }, def?: () => T): T {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return super.match(arms as any, def as any);
  }

  change_to(type: never): void;
  change_to<T extends "Continue" | "Break">(type: T, value: { Continue: C; Break: B; }[T]): void;
  change_to(type: "Continue" | "Break", value?: unknown): void {
    super.change_to(type, value);
  }

  is_continue(): boolean {
    return this.is("Continue");
  }

  is_break(): boolean {
    return this.is("Break");
  }

  unwrap_continue(): C {
    return this.match({
      Continue: (c) => c,
      Break: () => panic("Called `unwrap_continue` method on a `Break`"),
    });
  }

  unwrap_break(): B {
    return this.match({
      Continue: () => panic("Called `unwrap_break` method on a `Continue`"),
      Break: (b) => b,
    });
  }

  break_value(): Option<B> {
    return this.match({
      Continue: () => None(),
      Break: (b) => Some(b),
    });
  }

  map_break<T>(f: (b: B) => T): ControlFlow<T, C> {
    return this.match({
      Continue: (c) => ControlFlow.Continue(c),
      Break: (b) => ControlFlow.Break(f(b)),
    });
  }

  continue_value(): Option<C> {
    return this.match({
      Continue: (c) => Some(c),
      Break: () => None(),
    });
  }

  map_continue<T>(f: (b: C) => T): ControlFlow<B, T> {
    return this.match({
      Continue: (c) => ControlFlow.Continue(f(c)),
      Break: (b) => ControlFlow.Break(b),
    });
  }
}
