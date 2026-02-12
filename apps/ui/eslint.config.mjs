import baseConfig from "@repo/eslint-config"
import { next } from "@repo/eslint-config/configs"

/** @type {import("eslint").Linter.Config[]} */
export default [...baseConfig, ...next]
