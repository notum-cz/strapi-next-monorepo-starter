import stylistic from "@stylistic/eslint-plugin"
import globals from "globals"

export default [
  {
    ignores: [
      "**/.*", // dotfiles like .env, .gitignore
      "**/.*/**", // files inside dotfolders like .next/, .cache/
      "**/out/**",
      "**/node_modules/**",
      "**/dist/**",
      "**/generated/**",
      "**/build/**",
      "**/docs/**",
      "**/storybook-static/**",
      "**/coverage/**",
    ],
  },
  {
    plugins: {
      "@stylistic": stylistic,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    rules: {
      // Lines between class member methods
      "@stylistic/lines-between-class-members": [
        "error",
        "always",
        {
          exceptAfterSingleLine: true,
        },
      ],

      // Line spacing
      "@stylistic/padding-line-between-statements": [
        "error",
        {
          blankLine: "always",
          next: "class",
          prev: "*",
        },
        {
          blankLine: "always",
          next: "*",
          prev: "class",
        },
        {
          blankLine: "always",
          next: "return",
          prev: "*",
        },
        {
          blankLine: "always",
          next: "case",
          prev: "*",
        },
        {
          blankLine: "always",
          next: "default",
          prev: "*",
        },
        {
          blankLine: "always",
          next: "export",
          prev: "*",
        },
        {
          blankLine: "any",
          next: "case",
          prev: "case",
        },
        {
          blankLine: "any",
          next: "export",
          prev: "export",
        },
        {
          blankLine: "always",
          next: "*",
          prev: "import",
        },
        {
          blankLine: "any",
          next: "import",
          prev: "import",
        },
      ],
    },
  },
]
