import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import fileExtensionPlugin from "eslint-plugin-file-extension-in-import-ts";
import importPlugin from "eslint-plugin-import";

export default [
  { ignores: ["dist/"] },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        project: "tsconfig.json",
        projectService: {
          allowDefaultProject: [
            "eslint.config.js",
            "tsup.config.ts",
            "move_files.ts",
          ],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    plugins: {
      fileExtensionPlugin,
      importPlugin,
    },
    rules: {
      semi: ["error", "always"],
      "linebreak-style": ["error", "unix"],
      "no-trailing-spaces": ["warn", { ignoreComments: true }],
      "no-console": "warn",
      quotes: ["warn", "double", { avoidEscape: true }],
      eqeqeq: "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "comma-dangle": ["error", "always-multiline"],
      "@typescript-eslint/no-shadow": "warn",
      "fileExtensionPlugin/file-extension-in-import-ts": [
        "error",
        "always",
        { extMapping: { ".ts": ".ts" } },
      ],
      "importPlugin/order": "warn",
      "@typescript-eslint/strict-boolean-expressions": "error",
      curly: ["error", "multi-line", "consistent"],
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-deprecated": "warn",
    },
  },
];
