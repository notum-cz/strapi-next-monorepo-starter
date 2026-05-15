import fs from "node:fs"
import path from "node:path"

import { defineConfig, devices, type Project } from "@playwright/test"
import dotenv from "dotenv"

const envPath = path.resolve(__dirname, ".env")
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath, override: false })
}

const mobileViewportsEnabled =
  process.env.MOBILE_VIEWPORTS_TESTING_ENABLED === "true"

const projects: Project[] = [
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
    use: {
      ...devices["Desktop Safari"],
      // Desktop Safari defaults to deviceScaleFactor: 2, overriding to match Chromium/Firefox
      deviceScaleFactor: 1,
    },
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

projects.push(
  {
    name: "visual-chromium",
    testMatch: ["visual/**/*.spec.ts"],
    retries: 0,
    use: {
      ...devices["Desktop Chrome"],
      trace: "off",
      video: "off",
      screenshot: "off",
    },
  },
  {
    name: "visual-firefox",
    testMatch: ["visual/**/*.spec.ts"],
    retries: 0,
    use: {
      ...devices["Desktop Firefox"],
      trace: "off",
      video: "off",
      screenshot: "off",
    },
  },
  {
    name: "visual-webkit",
    testMatch: ["visual/**/*.spec.ts"],
    retries: 0,
    use: {
      ...devices["Desktop Safari"],
      deviceScaleFactor: 1,
      trace: "off",
      video: "off",
      screenshot: "off",
    },
  },
  {
    name: "seo",
    testMatch: ["seo/**/*.spec.ts"],
    retries: 1,
    use: {
      ...devices["Desktop Chrome"],
      trace: "off",
      screenshot: "off",
      video: "off",
    },
  },
  {
    name: "axe",
    testMatch: ["axe/**/*.spec.ts"],
    workers: 1,
    retries: 1,
    use: {
      ...devices["Desktop Chrome"],
      trace: "off",
      screenshot: "off",
      video: "off",
    },
  }
)

export default defineConfig({
  testDir: ".",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 3 : undefined,
  reporter: [["html", { open: process.env.CI ? "never" : "on-failure" }]],

  use: {
    baseURL: process.env.BASE_URL,

    // Uncomment if credentials are needed
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
