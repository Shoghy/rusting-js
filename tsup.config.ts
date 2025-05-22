import { defineConfig } from "tsup";
import { esbuildDecorators } from "@anatine/esbuild-decorators";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/enums/index.ts",
    "src/iterators/index.ts",
    "src/slices/index.ts",
    "src/strings/index.ts",
    "src/traits/index.ts",
  ],
  target: "es2017",
  format: ["cjs", "esm"],
  dts: true,
  splitting: true,
  clean: true,
  minifyWhitespace: true,
  esbuildPlugins: [esbuildDecorators()],
  noExternal: ["./package.json"],
});
