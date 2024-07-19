import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/enums/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  clean: true,
  minifyWhitespace: true,
});