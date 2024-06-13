import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";


export default [
  {languageOptions: { globals: {...globals.browser, ...globals.node} }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules:{
      semi: ["error", "always"],
      "linebreak-style": ["error", "unix"],
      "no-trailing-spaces": [
        "warn",
        { ignoreComments: true },
      ],
      "no-console": "warn",
      quotes: ["warn", "double"],
    },
  },
];