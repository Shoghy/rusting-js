import { type ControlFlow } from "../enums/control_flow";

export interface TryInstance<Output, Residual> {
  branch(): ControlFlow<Residual, Output>;
}

export interface TryStatic<Output, Residual> {
  from_output(output: Output): TryInstance<Output, Residual>;
}