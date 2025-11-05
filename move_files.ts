import { Glob } from "bun";

(async () => {
  const filesPaths = ["package.json", "README.md"];
  for (const filePath of filesPaths) {
    const file = Bun.file(`./${filePath}`);
    await Bun.write(`./dist/${filePath}`, file);
  }
  // eslint-disable-next-line no-console
  console.log("Files where moved");
})();

(async () => {
  const glob = new Glob("**/*.d.cts");
  const folder = "./dist";
  for await (const file of glob.scan(folder)) {
    await Bun.file(`${folder}/${file}`).delete();
  }
  // eslint-disable-next-line no-console
  console.log("`*.d.cts` files were deleted");
})();
