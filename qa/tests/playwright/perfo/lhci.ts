import "dotenv/config"

import { spawnSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"

import urls from "../helpers/urls.json"

const BASE_URL = process.env.BASE_URL

if (!BASE_URL) {
  throw new Error("Missing BASE_URL environment variable")
}

if (!Array.isArray(urls) || urls.length === 0) {
  throw new Error("No sites found in sites.json")
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

// eslint-disable-next-line sonarjs/no-os-command-from-path
const result = spawnSync("pnpm", args, {
  stdio: "inherit",
  cwd: CWD,
})

if (result.status !== 0) {
  throw new Error(`LHCI failed with status ${result.status ?? 1}`)
}
