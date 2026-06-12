/** biome-ignore-all lint/suspicious/noConsole: tool file */
void (async () => {
  const filesPaths = ["package.json", "README.md"];
  for (const filePath of filesPaths) {
    const file = Bun.file(`./${filePath}`);
    await Bun.write(`./dist/${filePath}`, file);
  }

  console.log("Files where moved");
})();
