#!/usr/bin/env node

/* eslint-disable no-console */

import { createRequire } from "node:module"
import path from "node:path"
import process from "node:process"
import { fileURLToPath } from "node:url"

const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const require = createRequire(import.meta.url)

const requiredDocuments = [
  { label: "Page", uid: "api::page.page" },
  { label: "Navbar", uid: "api::navbar.navbar" },
  { label: "Footer", uid: "api::footer.footer" },
]

process.env.STRAPI_TELEMETRY_DISABLED ??= "1"
const { compileStrapi, createStrapi } = require("@strapi/strapi")

normalizeDatabaseHost()

let strapi

try {
  strapi = await loadStrapi()

  const states = await Promise.all(
    requiredDocuments.map(async ({ label, uid }) => ({
      label,
      exists: await documentExists(uid),
    }))
  )

  const missing = states.filter(({ exists }) => !exists)

  for (const { label, exists } of states) {
    console.log(`[seed:check] ${label}: ${exists ? "exists" : "missing"}`)
  }

  if (missing.length > 0) {
    console.log(
      `[seed:check] Missing baseline content in: ${missing
        .map(({ label }) => label)
        .join(", ")}`
    )
    process.exitCode = 10
  } else {
    console.log("[seed:check] Baseline content exists.")
    process.exitCode = 0
  }
} catch (error) {
  console.error("[seed:check] Failed to check seed state.")
  if (error instanceof Error) {
    console.error(error.stack || error.message || error)
  } else {
    console.error(error)
  }
  process.exitCode = 1
} finally {
  await strapi?.destroy?.().catch(() => {})
}

async function loadStrapi() {
  const appContext = await compileStrapi({
    appDir,
    distDir: path.join(appDir, "dist"),
    autoReload: false,
    serveAdminPanel: false,
  })
  const app = createStrapi(appContext)

  app.log.level = "error"

  return app.load()
}

async function documentExists(uid) {
  const document = await strapi.documents(uid).findFirst({
    fields: ["documentId"],
  })

  return document !== null
}

function normalizeDatabaseHost() {
  if (process.env.DATABASE_HOST === "0.0.0.0") {
    process.env.DATABASE_HOST = "localhost"
  }
}
