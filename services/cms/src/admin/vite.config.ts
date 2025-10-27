import { mergeConfig } from "vite"

import type { UserConfig } from "vite"

export default (config: UserConfig) => {
  // Important: always return the modified config
  return mergeConfig(config, {
    resolve: {
      alias: {
        "@": "/src",
      },
    },
    optimizeDeps: {
      // Force pre-bundling of date-fns to resolve internal imports
      include: ["date-fns"],
      // Handle ESM module resolution for date-fns v4.x
      esbuildOptions: {
        mainFields: ["module", "main"],
      },
    },
    build: {
      // Handle date-fns ESM exports properly
      commonjsOptions: {
        include: [/date-fns/, /node_modules/],
      },
    },
  } as UserConfig)
}
