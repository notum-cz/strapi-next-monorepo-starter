import importPlugin from "eslint-plugin-import-x"

/** @type {import('eslint').Linter.Config[]} */
const config = [
  {
    plugins: { "import-x": importPlugin },
    settings: {
      "import-x/parsers": {
        espree: [".js", ".cjs", ".mjs", ".jsx"],
      },
      "import-x/resolver": {
        typescript: { alwaysTryTypes: true },
        node: true,
      },
    },
    rules: {
      ...importPlugin.configs.recommended.rules,
      "import-x/no-duplicates": ["error", { "prefer-inline": true }],
      "import-x/newline-after-import": ["error", { considerComments: false }],
      "import-x/no-unresolved": [
        "warn",
        {
          ignore: [
            String.raw`^@/`, // ignore @/* aliases
            "@(docusaurus|theme)",
          ],
        },
      ],
      "import-x/order": [
        "error",
        {
          groups: ["builtin", "external", "internal"],
          pathGroups: [
            {
              pattern: "{preact|react|svelte|docusaurus|theme}{/**,**}",
              group: "external",
              position: "before",
            },
            {
              pattern: "@/**",
              group: "internal",
              position: "after",
            },
            {
              pattern: "*.{css,less,json,html,txt,csv,png,jpg,svg}",
              group: "object",
              patternOptions: { matchBase: true },
              position: "after",
            },
          ],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
    },
  },
]

export default config
