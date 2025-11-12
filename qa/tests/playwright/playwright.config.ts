import { env } from "process"

import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",

  use: {
    baseURL: env.BASE_URL,
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },

    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },

    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },

    /* Test against mobile viewports. */
    //  {
    //    name: 'Mobile Chrome',
    //    use: { ...devices['Pixel 5'] },
    //  },
    //  {
    //    name: 'Mobile Safari',
    //    use: { ...devices['iPhone 12'] },
    //  },

    // /* Test against branded browsers. */
    //  {
    //    name: 'Microsoft Edge',
    //    use: { ...devices['Desktop Edge'], channel: 'msedge' },
    //  },
    //  {
    //    name: 'Google Chrome',
    //    use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    //  },
  ],
})
