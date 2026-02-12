import vitest from "@vitest/eslint-plugin"

import { files } from "../utils/helpers.js"

export default [
  {
    files: files.test,
    plugins: { vitest },
    rules: {
      ...vitest.configs.recommended.rules,
      "vitest/consistent-test-it": ["error", { fn: "it" }],
      "vitest/max-nested-describe": [
        "error",
        {
          max: 3,
        },
      ],
      "vitest/no-duplicate-hooks": "error",
      "vitest/no-conditional-in-test": "warn",
      "vitest/no-done-callback": "warn",
      "vitest/no-large-snapshots": [
        "warn",
        { maxSize: 100, inlineMaxSize: 20 },
      ],
      "vitest/no-mocks-import": "off",
      "vitest/no-test-return-statement": "warn",
      "vitest/prefer-expect-resolves": "error",
      "vitest/prefer-strict-equal": "warn",
      "vitest/prefer-spy-on": "off",
      "vitest/prefer-hooks-on-top": "error",
      "vitest/prefer-todo": "error",
      "vitest/require-hook": "warn",
      "vitest/prefer-called-with": "warn",
      "vitest/no-conditional-expect": "warn",
      "vitest/no-identical-title": "warn",
      "vitest/prefer-each": "error",
      "vitest/prefer-equality-matcher": "error",
      "vitest/prefer-comparison-matcher": "error",
      "vitest/prefer-mock-promise-shorthand": "error",
      "vitest/prefer-lowercase-title": [
        "error",
        {
          ignore: ["describe"],
        },
      ],

      // Padding rules (replaces jest-formatting)
      "vitest/padding-around-after-all-blocks": "error",
      "vitest/padding-around-after-each-blocks": "error",
      "vitest/padding-around-before-all-blocks": "error",
      "vitest/padding-around-before-each-blocks": "error",
      "vitest/padding-around-expect-groups": "error",
      "vitest/padding-around-describe-blocks": "error",
      "vitest/padding-around-test-blocks": "error",
    },
  },
]
