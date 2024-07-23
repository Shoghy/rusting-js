import { ControlFlow } from "../enums";

export interface Try<Output, Residual>{
  from_output(output: Output): Try<Output, Residual>;
  branch(): ControlFlow<Residual, Output>;
}