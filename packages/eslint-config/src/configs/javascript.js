import js from "@eslint/js"

export default [
  {
    ...js.configs.recommended,
    rules: {
      ...js.configs.recommended.rules,
      "no-return-await": "error",
      "no-console": [
        "warn",
        {
          allow: ["warn", "error", "debug", "dir"],
        },
      ],
      curly: ["error", "all"],
      "dot-notation": ["error"],
      "no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          ignoreRestSiblings: true,
          args: "none",
        },
      ],
    },
  },
]
