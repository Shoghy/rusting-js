import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

export default [
  { ignores: ["dist/"] },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    rules: {
      semi: ["error", "always"],
      "linebreak-style": ["error", "unix"],
      "no-trailing-spaces": ["warn", { ignoreComments: true }],
      "no-console": "warn",
      quotes: ["warn", "double", { avoidEscape: true }],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { varsIgnorePattern: "^_" },
      ],
      "comma-dangle": ["error", "always-multiline"],
      "@typescript-eslint/no-shadow": "warn",
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { disallowTypeAnnotations: false, fixStyle: "inline-type-imports" },
      ],
    },
  },
];
