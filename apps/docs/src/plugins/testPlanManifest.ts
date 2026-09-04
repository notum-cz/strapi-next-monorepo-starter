/**
 * Scans apps/docs/docs/QA/test-cases/**\/*.md at build time and
 * exposes every manual scenario, across every page, as a flat list keyed by
 * pageId (the file's path relative to test-cases/, without extension).
 * TestPlanExport (src/components/TestPlanExport) reads this via
 * usePluginData to know what to look for in localStorage — without this, an
 * export button would only know about pages a QA engineer already happened
 * to visit in that browser.
 *
 * Test case pages live flat under test-cases/ by default — there's no
 * required folder-per-plan structure. A "Test Plan" is just a page that
 * renders <TestPlanExport pages={[...]} />, naming the pageIds it curates;
 * omitting `pages` covers every page in the manifest (see the root
 * test-cases/index.md). Because plans reference pages instead of owning
 * them, the same page can appear in more than one plan.
 *
 * Route computation assumes the default docs routeBasePath ("docs") and no
 * custom `slug` frontmatter on test-case pages — see write-test-cases skill.
 */
import fs from "fs"
import path from "path"
import type { LoadContext, Plugin } from "@docusaurus/types"

import { extractChecklistBlocks, type Scenario } from "../lib/gherkin"

const TEST_CASES_DIR = path.join("docs", "QA", "test-cases")
const DOCS_ROUTE_BASE_PATH = "docs"

export interface ManifestEntry {
  pageId: string
  path: string
  featureName: string
  blockIndex: number
  scenarios: Scenario[]
}

export type TestPlanManifest = ManifestEntry[]

function walkMarkdownFiles(dir: string, files: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walkMarkdownFiles(fullPath, files)
    } else if (entry.name.endsWith(".md") && entry.name !== "index.md") {
      files.push(fullPath)
    }
  }
  return files
}

function toPageId(testCasesDir: string, filePath: string): string {
  return path
    .relative(testCasesDir, filePath)
    .replace(/\\/g, "/")
    .replace(/\.mdx?$/, "")
}

function fileToRoute(siteDir: string, filePath: string, baseUrl: string): string {
  const docsRoot = path.join(siteDir, "docs")
  const relative = path.relative(docsRoot, filePath).replace(/\\/g, "/")
  const withoutExt = relative.replace(/\.mdx?$/, "")
  return `${baseUrl}${DOCS_ROUTE_BASE_PATH}/${withoutExt}`
}

export default function testPlanManifestPlugin(context: LoadContext): Plugin<unknown> {
  return {
    name: "test-plan-manifest",

    async loadContent(): Promise<TestPlanManifest> {
      const testCasesDir = path.join(context.siteDir, TEST_CASES_DIR)
      if (!fs.existsSync(testCasesDir)) return []

      const manifest: TestPlanManifest = []

      for (const filePath of walkMarkdownFiles(testCasesDir)) {
        const blocks = extractChecklistBlocks(fs.readFileSync(filePath, "utf-8"))
        if (blocks.length === 0) continue

        const pageId = toPageId(testCasesDir, filePath)
        const routePath = fileToRoute(context.siteDir, filePath, context.siteConfig.baseUrl)

        for (const block of blocks) {
          manifest.push({
            pageId,
            path: routePath,
            featureName: block.featureName,
            blockIndex: block.blockIndex,
            scenarios: block.scenarios,
          })
        }
      }

      return manifest
    },

    async contentLoaded({ content, actions }) {
      actions.setGlobalData(content)
    },

    getPathsToWatch() {
      return [path.join(TEST_CASES_DIR, "**", "*.md")]
    },
  }
}
