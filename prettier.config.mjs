import { prettierOptions } from "@repo/eslint-config/configs"

/**
 * The main use of prettier is to run it through eslint, this is mainly to
 * support editor bindings to use the same options as eslint package.
 */
export default prettierOptions
