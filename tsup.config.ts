import { defineConfig } from "tsup";
import { esbuildDecorators } from "@anatine/esbuild-decorators";

export default defineConfig({
  entry: [
    "src/defer.ts",
    "src/index.ts",
    "src/enums/index.ts",
    "src/iterators/index.ts",
    "src/slices/index.ts",
    "src/strings/index.ts",
    "src/traits/index.ts",
  ],
  target: "esnext",
  format: ["cjs", "esm"],
  dts: true,
  splitting: true,
  clean: true,
  minifyWhitespace: true,
  esbuildPlugins: [esbuildDecorators()],
  noExternal: ["./package.json"],
});
