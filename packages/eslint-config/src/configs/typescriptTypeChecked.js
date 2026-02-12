import tsEslint from "typescript-eslint"

import { files } from "../utils/helpers.js"

/**
 * @param {import('eslint').Linter.Config | import('eslint').Linter.Config[]} preset
 * @returns {import('eslint').Linter.RulesRecord}
 */
const extractRules = (preset) => {
  const presets = Array.isArray(preset) ? preset : [preset]

  return presets.reduce(
    (rules, entry) => (entry?.rules ? { ...rules, ...entry.rules } : rules),
    /** @type {import('eslint').Linter.RulesRecord} */ ({})
  )
}

const typeCheckedRules = {
  ...extractRules(tsEslint.configs.recommendedTypeChecked),
  ...extractRules(tsEslint.configs.stylisticTypeChecked),
}

/** @type {import('eslint').Linter.Config[]} */
const config = [
  {
    files: files.ts,
    languageOptions: {
      parserOptions: { projectService: true },
    },
    rules: {
      ...typeCheckedRules,
      "@typescript-eslint/consistent-type-exports": "error",
      "@typescript-eslint/only-throw-error": "error",
      "@typescript-eslint/no-useless-default-assignment": "warn",
      "@typescript-eslint/strict-void-return": "error",
      "no-undef": "off",
    },
  },
]

export default config
