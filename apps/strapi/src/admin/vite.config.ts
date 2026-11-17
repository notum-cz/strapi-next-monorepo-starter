// `vite` is a devDependency pinned to the version Strapi bundles internally
// (also required by Vitest 5), so it resolves without suppressions.
import { mergeConfig, type UserConfig } from "vite"

export default (config: UserConfig) => {
  // Important: always return the modified config
  return mergeConfig(config, {
    resolve: {
      alias: {
        "@": "/src",
      },
    },
  } as UserConfig)
}
