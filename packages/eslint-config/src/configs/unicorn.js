import unicorn from "eslint-plugin-unicorn"

export default [
  {
    ...unicorn.configs.recommended,
    rules: {
      ...unicorn.configs.recommended.rules,
      "unicorn/filename-case": "off",
      "unicorn/no-array-callback-reference": "off",
      "unicorn/prefer-global-this": "off",
      "unicorn/no-for-each": "off",
      "unicorn/no-negated-condition": "off",
      "unicorn/no-array-reduce": "off",
      "unicorn/no-anonymous-default-export": "off",
      "unicorn/no-array-sort": "off",
      "unicorn/no-array-reverse": "off",
      "unicorn/no-document-cookie": "warn",
      "unicorn/no-null": "off",
      "unicorn/no-static-only-class": "off",
      "unicorn/no-unused-properties": "warn",
      "unicorn/numeric-separators-style": [
        "error",
        { onlyIfContainsSeparator: true },
      ],
      "unicorn/prefer-export-from": ["error", { checkUsedVariables: false }],
      "unicorn/prefer-module": "off",
      "unicorn/switch-case-braces": ["error", "avoid"],
      "unicorn/prefer-object-from-entries": "warn",
      "unicorn/catch-error-name": "off",
      "unicorn/name-replacements": "off",
      "unicorn/relative-url-style": ["error", "always"],
      "unicorn/consistent-function-scoping": "warn",
      "unicorn/prefer-spread": "off",
      "unicorn/no-typeof-undefined": ["error", { checkGlobalVariables: false }],
      "unicorn/no-await-expression-member": "off",
      "unicorn/explicit-length-check": "off",
      "unicorn/prefer-logical-operator-over-ternary": "warn",
      "unicorn/consistent-destructuring": "warn",
      "unicorn/no-unreadable-iife": "warn",
      "unicorn/prefer-event-target": "warn",
      "unicorn/prefer-query-selector": "off",
      "unicorn/prefer-string-slice": "off",
      "unicorn/no-useless-undefined": ["error", { checkArguments: false }],

      // Style rules turned off due to prettier
      "unicorn/empty-brace-spaces": "off",

      // Conflicts with the JSDoc `/** ... */` block style used across the repo
      "unicorn/no-asterisk-prefix-in-documentation-comments": "off",

      // This causes issues with some frameworks but is really rare to use
      "unicorn/no-array-method-this-argument": "off",

      // Added to `recommended` between unicorn 67 and 79. Their autofixes
      // rewrite working code into a different style (nested ternaries, renamed
      // booleans, block comments without JSDoc asterisks, `getHTML()` for
      // `innerHTML`, ...), so they are off to keep the dependency upgrade
      // behaviour-neutral. Turn them on one at a time in a dedicated change.
      "unicorn/consistent-boolean-name": "off",
      "unicorn/default-export-style": "off",
      "unicorn/no-top-level-assignment-in-function": "off",
      "unicorn/no-unnecessary-boolean-comparison": "off",
      "unicorn/no-unnecessary-parameters": "off",
      "unicorn/no-unreadable-for-of-expression": "off",
      "unicorn/prefer-combined-guards": "off",
      "unicorn/prefer-continue": "off",
      "unicorn/prefer-default-parameters": "off",
      "unicorn/prefer-dom-node-html-methods": "off",
      "unicorn/prefer-early-return": "off",
      "unicorn/prefer-minimal-ternary": "off",
      "unicorn/prefer-simple-condition-first": "off",
      "unicorn/prefer-single-object-destructuring": "off",
      "unicorn/prefer-smaller-scope": "off",
      "unicorn/prefer-split-limit": "off",
      "unicorn/prefer-ternary": "off",
      "unicorn/single-line-block-comment-style": "off",
    },
  },
]
