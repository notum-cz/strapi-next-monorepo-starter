import { createRequire } from "node:module"

import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended"

const require = createRequire(import.meta.url)

export const prettierOptions = {
  singleQuote: false,
  semi: false,
  tabWidth: 2,
  useTabs: false,
  endOfLine: "lf",
  trailingComma: "es5",
  jsxSingleQuote: false,
  bracketSameLine: false,
  arrowParens: "always",
  plugins: [
    require.resolve("prettier-plugin-packagejson"),
    require.resolve("prettier-plugin-tailwindcss"),
  ],
}

export default [
  eslintPluginPrettierRecommended,
  { rules: { "prettier/prettier": ["error", prettierOptions] } },
]
