import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.{js,ts}"],
    exclude: ["node_modules", ".tmp", ".cache"],
    testTimeout: 30000,
    server: {
      deps: {
        // Inline strapi and lodash to handle CJS/ESM compatibility
        inline: [/@strapi\/.*/, /lodash/],
      },
    },
  },
})
