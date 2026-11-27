/**
 * StrykerJS mutation testing config.
 * Docs: apps/docs/docs/QA/mutation-testing.md
 *
 * @type {import("@stryker-mutator/api/core").PartialStrykerOptions}
 */
export default {
  // Listed explicitly: pnpm's isolated node_modules hides the runner from
  // Stryker's default "@stryker-mutator/*" plugin discovery.
  plugins: ["@stryker-mutator/vitest-runner"],
  testRunner: "vitest",
  vitest: {
    configFile: "vitest.config.ts",
  },
  // Only modules covered by tests in tests/. When you add a test for a new
  // module, add the module here so its mutants are measured.
  mutate: [
    "src/api/revalidate/services/*.ts",
    "src/documentMiddlewares/*.ts",
    "src/api/hierarchy/services/hierarchy.ts",
    "src/api/hierarchy/utils/index.ts",
    "src/api/page/content-types/page/lifecycles.ts",
    "src/utils/validate-admin-token.ts",
  ],
  reporters: ["clear-text", "progress", "html", "json"],
  htmlReporter: {
    fileName: "reports/mutation/index.html",
  },
  jsonReporter: {
    fileName: "reports/mutation/mutation.json",
  },
  incremental: true,
  incrementalFile: "reports/mutation/stryker-incremental.json",
  ignoreStatic: true,
  // Report only for now; set `break` once a baseline score is established.
  thresholds: {
    high: 80,
    low: 60,
    break: null,
  },
  tempDirName: ".stryker-tmp",
  cleanTempDir: "always",
}
