import globals from "globals";
import pluginJs from "@eslint/js";
import mochaPlugin from 'eslint-plugin-mocha';


export default [
  {
    languageOptions: {
      globals: globals.node
    }
  },
  pluginJs.configs.recommended,
  {
    rules: {
      // note you must disable the base rule as it can report incorrect errors
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn", // or "error"
        {
          "argsIgnorePattern": "_",
          "varsIgnorePattern": "_",
          "caughtErrorsIgnorePattern": "_"
        }
      ]
    }
  },
  mochaPlugin.configs.flat.recommended
];