import {
  base,
  imprt,
  javascript,
  prettier,
  react,
  sonarjs,
  turbo,
  typescript,
  unicorn,
  unusedImports,
} from "./src/configs/index.js"

export default [
  ...base,
  ...javascript,
  ...typescript,
  ...react,
  ...turbo,
  ...imprt,
  ...sonarjs,
  ...unicorn,
  ...unusedImports,
  ...prettier,
]
