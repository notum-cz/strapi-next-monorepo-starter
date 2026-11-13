/**
 * Inserts a <GherkinChecklist> node right after every ```gherkin code block,
 * one Pass/Fail row per @manual Scenario/Scenario Outline. The component
 * (see src/components/GherkinChecklist) persists results to localStorage —
 * per-browser only, not shared across the team. The test-plan-manifest
 * plugin (src/plugins/testPlanManifest.ts) scans the same files independently
 * to build a plan-level export button; see src/lib/gherkin.ts for the shared
 * parsing both rely on.
 */
import { visit } from "unist-util-visit"

import { extractManualScenarios } from "../lib/gherkin"

export default function remarkGherkinChecklist() {
  return (tree: unknown) => {
    let blockIndex = 0

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- mdast/mdx node shapes aren't worth pulling in extra type packages for
    visit(tree as any, "code", (node: any, index: number | undefined, parent: any) => {
      if (node.lang !== "gherkin" || !parent || index === undefined) return

      const manualScenarios = extractManualScenarios(node.value)
      if (manualScenarios.length === 0) return

      parent.children.splice(index + 1, 0, {
        type: "mdxJsxFlowElement",
        name: "GherkinChecklist",
        attributes: [
          {
            type: "mdxJsxAttribute",
            name: "scenarios",
            value: JSON.stringify(manualScenarios),
          },
          {
            type: "mdxJsxAttribute",
            name: "blockIndex",
            value: String(blockIndex),
          },
        ],
        children: [],
      })

      blockIndex += 1
    })
  }
}
