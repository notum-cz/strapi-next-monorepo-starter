import fs from "node:fs"
import path from "node:path"

import { defineConfig, devices } from "@playwright/test"
import dotenv from "dotenv"

const envPath = path.resolve(__dirname, ".env")
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath, override: false })
}

const mobileViewportsEnabled =
  process.env.MOBILE_VIEWPORTS_TESTING_ENABLED === "true"

const projects = [
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
]

if (mobileViewportsEnabled) {
  projects.push(
    // Android
    {
      name: "Mobile Chrome (Pixel 7)",
      use: { ...devices["Pixel 7"] },
    },
    // iOS
    {
      name: "Mobile Safari (iPhone 15)",
      use: { ...devices["iPhone 15"] },
    }
  )
}

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",

  use: {
    baseURL: process.env.BASE_URL,

    // httpCredentials: {
    //   username: "xx",
    //   password: "yyy",
    // },

    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects,
})
