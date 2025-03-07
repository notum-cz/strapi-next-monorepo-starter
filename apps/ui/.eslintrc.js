/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["@repo/eslint-config/next.js", "plugin:jsx-a11y/recommended"],
  parser: "@typescript-eslint/parser",
  plugins: ["jsx-a11y"],
  settings: {
    tailwindcss: {
      callees: ["cn"],
      config: "tailwind.config.js",
    },
  },
  parserOptions: {
    project: true,
  },
  rules: {
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "@next/next/no-html-link-for-pages": "off",
    "no-unused-vars": "warn",
    "react/function-component-definition": "off",
    "react/hook-use-state": "off",
    "react/jsx-no-leaked-render": "off",
    "react/jsx-sort-props": "off",
    "react/no-array-index-key": "off",
    "react/no-unstable-nested-components": [
      "warn",
      {
        allowAsProps: true,
        customValidators: [],
      },
    ],
    "tailwindcss/no-custom-classname": "off",
    "turbo/no-undeclared-env-vars": "off",
    "no-extra-boolean-cast": "warn",
    "jsx-a11y/alt-text": [
      "error",
      {
        elements: ["img", "object", "area", "input[type='image']"],
        img: ["Image"],
        object: ["Object"],
        area: ["Area"],
        "input[type='image']": ["InputImage"],
      },
    ],
    "jsx-a11y/no-autofocus": "off",
  },
  overrides: [
    {
      files: ["src/components/ui/*.tsx"],
      rules: {
        "tailwindcss/enforces-shorthand": "off",
        "react/jsx-curly-brace-presence": "off",
        "tailwindcss/no-unnecessary-arbitrary-value": "off",
        "no-unused-vars": "off",
      },
    },
  ],
}
