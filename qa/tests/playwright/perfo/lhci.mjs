import "dotenv/config"

import { spawnSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"

import urls from "../helpers/urls.json" with { type: "json" }

const BASE_URL = process.env.BASE_URL

if (!BASE_URL) {
  console.error("Missing BASE_URL environment variable")
  process.exit(1)
}

if (!Array.isArray(urls) || urls.length === 0) {
  console.error("No sites found in sites.json")
  process.exit(1)
}

const fullUrls = urls.map((p) => `${BASE_URL}${p}`)

const CWD = path.resolve("perfo")

fs.mkdirSync(CWD, { recursive: true })

const args = [
  "lhci",
  "collect",
  ...fullUrls.flatMap((url) => ["--url", url]),
  "--numberOfRuns=1",
]

const result = spawnSync("pnpm", args, {
  stdio: "inherit",
  cwd: CWD,
})

process.exit(result.status ?? 1)
