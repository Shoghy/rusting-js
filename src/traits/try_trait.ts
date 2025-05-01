import { type ControlFlow } from "../enums/control_flow.ts";

export interface TryInstance<Output, Residual> {
  branch(): ControlFlow<Residual, Output>;
}

export interface TryStatic<Output, Residual> {
  fromOutput(output: Output): TryInstance<Output, Residual>;
}
