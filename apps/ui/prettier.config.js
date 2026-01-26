const globalConfig = require("@repo/prettier-config")

/** @type {import('prettier').Config} */
module.exports = {
  ...globalConfig,
  plugins: [
    ...globalConfig.plugins,
    require.resolve("prettier-plugin-tailwindcss"),
  ],
}
