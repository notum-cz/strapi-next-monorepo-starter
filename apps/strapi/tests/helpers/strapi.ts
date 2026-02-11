import { existsSync } from "node:fs"
import fs from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"

import { compileStrapi, createStrapi } from "@strapi/strapi"

import type { Core } from "@strapi/strapi"

let instance: Core.Strapi = null!
let tmpDir: string
let tmpDbFile: string

const resolve = (basePath: string, ...paths: string[]) => {
  const pathStr = path.join(...paths)
  return path.resolve(basePath.replace(pathStr, ""), pathStr)
}

export const setupStrapi = async () => {
  if (!instance) {
    process.env.STRAPI_TELEMETRY_DISABLED = "1"
    const systemTempDir = process.env.RUNNER_TEMP ?? tmpdir()
    tmpDir = await fs.mkdtemp(path.join(systemTempDir, "strapi-test-"))
    tmpDbFile = resolve(tmpDir, "test.db")

    // Use SQLite for testing
    // First, add "better-sqlite3" to deps, then set client:
    // process.env.DATABASE_CLIENT = "sqlite"
    // process.env.DATABASE_FILENAME = tmpDbFile
    const options = {
      appDir: process.cwd(),
      distDir: resolve(process.cwd(), "dist"),
      autoReload: false,
      serveAdminPanel: false,
    }
    await compileStrapi(options)

    instance = await createStrapi(options).load()
    instance.server.mount()
  }

  return { instance }
}

export const teardownStrapi = async () => {
  if (!instance) return

  // 0. Cancel ALL node-schedule jobs aggressively
  try {
    const schedule = require("node-schedule")
    const jobs = schedule.scheduledJobs
    Object.keys(jobs).forEach((name) => {
      jobs[name].cancel(true) // Force cancel
      delete jobs[name]
    })
    await schedule.gracefulShutdown?.()
  } catch (_e) {
    /* noop */
  }

  try {
    // 1. Stop HTTP server first (promisify the callback)
    if (instance.server?.httpServer) {
      await new Promise<void>((resolve) => {
        instance.server.httpServer.close(() => {
          resolve()
        })
      })
    }

    // 2. Destroy Strapi server components
    if (instance.server?.destroy) {
      await instance.server.destroy()
    }

    // 3. Close database connections
    if (instance.db?.connection) {
      await instance.db.connection.destroy()
    }

    // 4. Destroy database instance
    if (instance.db?.destroy) {
      await instance.db.destroy()
    }

    // 5. Clean up temp files and directory
    if (tmpDir && existsSync(tmpDir)) {
      await fs.rm(tmpDir, { recursive: true, force: true })
    }

    // 6. Clear instance reference
    instance = null!
  } catch (_error) {
    // Still clear the instance to prevent reuse
    instance = null!
  }
}

// Export getter to access strapi after setup
export const strapi = new Proxy({} as Core.Strapi, {
  get(_, prop) {
    if (!instance) {
      throw new Error("Strapi not initialized. Call setupStrapi() first.")
    }
    return (instance as any)[prop]
  },
})
