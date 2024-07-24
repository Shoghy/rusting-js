import { Enum } from ".";
import type { TryStatic } from "../traits/try_trait";
import { staticImplements } from "../utils";

@staticImplements<TryStatic<unknown, ControlFlow<unknown, unknown>>>()
export class ControlFlow<B, C> extends Enum({
  Continue: "unknown",
  Break: "unknown",
}) {
  static from_output<B, C>(output: C): ControlFlow<B, C> {
    return ControlFlow.Continue(output);
  }

  branch(): ControlFlow<ControlFlow<B, C>, C> {
    return this.match({
      Continue: (c) => ControlFlow.Continue(c),
      Break: (b) => ControlFlow.Break(ControlFlow.Break(b)),
    });
  }

  static Continue<B, C>(value: C): ControlFlow<B, C>{
    return new ControlFlow("Continue", value);
  }

  static Break<B, C>(value: B): ControlFlow<B, C>{
    return new ControlFlow("Break", value);
  }

  match<T>(arms: { Continue: (value: C) => T; Break: (value: B) => T; }): T;
  match<T>(arms: { Continue?: ((value: C) => T); Break?: ((value: B) => T); }, def: () => T): T;
  match<T>(arms: { Continue?: ((value: C) => T); Break?: ((value: B) => T); }, def?: () => T): T {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return super.match(arms as any, def as any);
  }
}