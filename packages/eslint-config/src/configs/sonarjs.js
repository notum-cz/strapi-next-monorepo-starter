import sonarjs from "eslint-plugin-sonarjs"

import { files } from "../utils/helpers.js"

export default [
  {
    plugins: { sonarjs },
    rules: {
      ...sonarjs.configs.recommended.rules,
      "sonarjs/no-nested-functions": "warn",
      "sonarjs/slow-regex": "warn",
      "sonarjs/pseudo-random": "off",
      "sonarjs/fixme-tag": "warn",
      "sonarjs/redundant-type-aliases": "warn",
      "sonarjs/no-unused-vars": "off",
      "sonarjs/no-globals-shadowing": "warn",
      "sonarjs/no-clear-text-protocols": "off",
      "sonarjs/no-nested-conditional": "off",
      "sonarjs/no-hardcoded-secrets": "warn",
      "sonarjs/no-hardcoded-passwords": "warn",
      "sonarjs/todo-tag": "warn",
      "sonarjs/cognitive-complexity": "warn",
      "sonarjs/no-identical-functions": ["warn", 3],
      "sonarjs/no-duplicate-string": ["warn", { threshold: 10 }],
      "sonarjs/no-nested-template-literals": "off",
      "sonarjs/no-useless-catch": "warn",
      "sonarjs/no-inverted-boolean-check": "warn",
    },
  },
  {
    files: files.test,
    rules: {
      "sonarjs/no-duplicate-string": "off",
    },
  },
  {
    files: [
      "**/translations/**",
      "**/locales/**",
      "**/i18n/**",
      "**/cs.ts",
      "**/en.ts",
    ],
    rules: {
      "sonarjs/no-hardcoded-passwords": "off", // eslint-disable-line sonarjs/no-hardcoded-passwords
      "sonarjs/no-hardcoded-secrets": "off",
    },
  },
]
