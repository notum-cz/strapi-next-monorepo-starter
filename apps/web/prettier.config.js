const globalConfig = require("@repo/prettier-config")

/** @type {import('prettier').Config} */
module.exports = {
  ...globalConfig,
  plugins: [...globalConfig.plugins, "prettier-plugin-tailwindcss"],
}
