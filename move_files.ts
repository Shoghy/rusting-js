(async () => {
  const filesPaths = ["package.json", "README.md"];
  for (const filePath of filesPaths) {
    const file = Bun.file(`./${filePath}`);
    await Bun.write(`./dist/${filePath}`, file);
  }
  // eslint-disable-next-line no-console
  console.log("Files where moved");
})();
