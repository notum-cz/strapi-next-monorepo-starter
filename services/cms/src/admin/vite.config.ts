import { mergeConfig } from "vite"

import type { UserConfig } from "vite"

export default (config: UserConfig) => {
  // Important: always return the modified config
  return mergeConfig(config, {
    resolve: {
      alias: {
        "@": "/src",
      },
      // Deduplicate date-fns to use a single version (forced to 3.6.0 via resolutions)
      dedupe: ["date-fns"],
    },
    optimizeDeps: {
      // Force pre-bundling of date-fns to avoid module resolution issues
      include: ["date-fns"],
      esbuildOptions: {
        mainFields: ["module", "main"],
      },
    },
    ssr: {
      // Force bundling of date-fns in SSR mode to avoid module resolution issues
      noExternal: ["date-fns"],
    },
    build: {
      // Handle date-fns ESM exports properly
      commonjsOptions: {
        include: [/date-fns/, /node_modules/],
      },
    },
  } as UserConfig)
}
