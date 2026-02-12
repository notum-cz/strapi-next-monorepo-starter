import turboPlugin from "eslint-plugin-turbo"

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      "turbo/no-undeclared-env-vars": "warn",
    },
  },
]
