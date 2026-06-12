import { exists, rm } from "node:fs/promises";
import Bun from "bun";

if (await exists("dist")) {
  await rm("dist", { recursive: true });
}

await Bun.build({
  entrypoints: [
    "src/index.ts",
    "src/enums/index.ts",
    "src/iterators/index.ts",
    "src/slices/index.ts",
    "src/strings/index.ts",
    "src/traits/index.ts",
  ],
  target: "browser",
  format: "esm",
  splitting: true,
  emitDCEAnnotations: true,
  minify: {
    keepNames: true,
    syntax: true,
    whitespace: true,
  },
  outdir: "./dist",
});
