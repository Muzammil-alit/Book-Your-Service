// backend/eslint.config.js
const js = require("@eslint/js");
const tseslint = require("@typescript-eslint/eslint-plugin");
const tsparser = require("@typescript-eslint/parser");
const prettier = require("eslint-plugin-prettier");

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      parser: tsparser,
      ecmaVersion: "latest",
      sourceType: "module"
    },
    plugins: {
      "@typescript-eslint": tseslint,
      prettier: prettier
    },
    rules: {
      "prettier/prettier": "error",
      "no-console": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "no-var": "error",
      "prefer-const": "error"
    }
  }
];
