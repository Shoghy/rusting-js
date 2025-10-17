import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import importPlugin from "eslint-plugin-import";

export default defineConfig([
  { ignores: ["dist/"] },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        project: "tsconfig.json",
        projectService: {
          allowDefaultProject: [
            "eslint.config.ts",
            "tsup.config.ts",
            "move_files.ts",
          ],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  tseslint.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    plugins: {
      import: importPlugin,
    },
    rules: {
      semi: ["error", "always"],
      "linebreak-style": ["error", "unix"],
      "no-trailing-spaces": ["warn", { ignoreComments: true }],
      "no-console": "warn",
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
      "import/order": "warn",
      "import/extensions": ["error", "ignorePackages"],
      "@typescript-eslint/strict-boolean-expressions": "error",
      curly: ["error", "multi-line", "consistent"],
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-deprecated": "warn",
    },
  },
]);
