// @ts-expect-error vite is provided by Strapi internally
// eslint-disable-next-line import-x/no-unresolved
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
