#!/usr/bin/env node
// Lists the mutants that tests did not catch, read from a StrykerJS JSON report.
//
// Usage (from the repo root):
//   node .claude/skills/mutation-test/scripts/survivors.mjs <ui|strapi> [file ...]
//
// <file> is a path relative to the app (e.g. src/lib/dates.ts), as listed in
// the app's stryker.config.mjs `mutate`. With no files, every mutated file is
// summarised. Set STATUSES=Survived to hide NoCoverage mutants.

import { existsSync, readFileSync } from "node:fs"
import path from "node:path"

const [app, ...files] = process.argv.slice(2)

if (!app || !["ui", "strapi"].includes(app)) {
  console.error("Usage: survivors.mjs <ui|strapi> [file ...]")
  process.exit(2)
}

const reportPath = path.join(
  "apps",
  app,
  "reports",
  "mutation",
  "mutation.json"
)

if (!existsSync(reportPath)) {
  console.error(
    `No report at ${reportPath}. Run Stryker first: pnpm test:mutation:${app}`
  )
  process.exit(1)
}

const report = JSON.parse(readFileSync(reportPath, "utf8"))
const statuses = (process.env.STATUSES ?? "Survived,NoCoverage").split(",")

// Test id -> "test file > test name", for the "covered by" hint.
const testNames = new Map()
for (const [testFile, { tests }] of Object.entries(report.testFiles ?? {})) {
  for (const test of tests) testNames.set(test.id, `${testFile} > ${test.name}`)
}

const detected = new Set(["Killed", "Timeout"])
const invalid = new Set(["CompileError", "RuntimeError", "Ignored"])

const score = (mutants) => {
  const valid = mutants.filter((m) => !invalid.has(m.status))
  const caught = valid.filter((m) => detected.has(m.status)).length
  return valid.length ? ((caught / valid.length) * 100).toFixed(1) : "n/a"
}

const snippet = (source, { start, end }) => {
  const lines = source.split("\n")
  const text =
    start.line === end.line
      ? lines[start.line - 1].slice(start.column - 1, end.column - 1)
      : `${lines[start.line - 1].slice(start.column - 1)} …`
  const oneLine = text.replace(/\s+/g, " ").trim()
  return oneLine.length > 70 ? `${oneLine.slice(0, 67)}...` : oneLine
}

const targets = files.length ? files : Object.keys(report.files).sort()
let exitCode = 0

for (const file of targets) {
  const entry = report.files[file]

  if (!entry) {
    console.error(
      `\n${file}: not in the report. Add it to apps/${app}/stryker.config.mjs \`mutate\` and rerun Stryker.`
    )
    exitCode = 1
    continue
  }

  const open = entry.mutants
    .filter((m) => statuses.includes(m.status))
    .sort((a, b) => a.location.start.line - b.location.start.line)

  console.log(
    `\n${file}  score ${score(entry.mutants)}%  (${open.length} not caught of ${entry.mutants.length})`
  )

  if (!files.length) continue

  for (const m of open) {
    const { line, column } = m.location.start
    const covered = (m.coveredBy ?? []).map((id) => testNames.get(id) ?? id)
    console.log(
      `  ${String(line).padStart(4)}:${String(column).padEnd(3)} ${m.status.padEnd(10)} ${m.mutatorName}: ${snippet(entry.source, m.location)}  ->  ${m.replacement ?? "?"}`
    )
    if (covered.length) {
      const shown = covered.slice(0, 2).join("; ")
      const more = covered.length > 2 ? ` (+${covered.length - 2} more)` : ""
      console.log(`             covered by: ${shown}${more}`)
    }
  }
}

process.exit(exitCode)
