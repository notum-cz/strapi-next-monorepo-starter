interface Scenario {
  type: string
  title: string
  tags: string[]
}

type Status = "pass" | "fail" | null

type Results = Record<number, Status>

interface PlanFeature {
  featureName: string
  pageUrl: string
  scenarios: Scenario[]
  results: Results
}

interface BuildPlanReportOptions {
  planName: string
  features: PlanFeature[]
  generatedAt: Date
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}

function statusLabel(status: Status): "Pass" | "Fail" | "Untested" {
  if (status === "pass") return "Pass"
  if (status === "fail") return "Fail"
  return "Untested"
}

export function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "plan"
  )
}

export function buildPlanReport({ planName, features, generatedAt }: BuildPlanReportOptions): string {
  let passCount = 0
  let failCount = 0
  let untestedCount = 0

  const sections = features
    .map(({ featureName, pageUrl, scenarios, results }) => {
      const rows = scenarios
        .map((scenario, i) => {
          const label = statusLabel(results[i] ?? null)
          if (label === "Pass") passCount += 1
          else if (label === "Fail") failCount += 1
          else untestedCount += 1

          return `      <tr class="status-${label.toLowerCase()}">
        <td>${i + 1}</td>
        <td>${escapeHtml(scenario.title)}</td>
        <td class="tags">${escapeHtml(scenario.tags.join(" "))}</td>
        <td class="status">${label}</td>
      </tr>`
        })
        .join("\n")

      return `  <h2>${escapeHtml(featureName)}</h2>
  <p class="meta"><a href="${escapeHtml(pageUrl)}">${escapeHtml(pageUrl)}</a></p>
  <table>
    <thead>
      <tr><th>#</th><th>Scenario</th><th>Tags</th><th>Status</th></tr>
    </thead>
    <tbody>
${rows}
    </tbody>
  </table>`
    })
    .join("\n\n")

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Test plan results — ${escapeHtml(planName)}</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; max-width: 900px; margin: 2.5rem auto; padding: 0 1.5rem; color: #2b292d; }
  h1 { margin-bottom: 0.25rem; }
  h2 { margin: 2rem 0 0.25rem; font-size: 1.15rem; }
  .meta { color: #5d5d5d; font-size: 0.92rem; margin: 0.15rem 0 0.75rem; }
  .summary { display: flex; gap: 0.75rem; margin: 1.25rem 0; }
  .badge { display: inline-flex; align-items: center; padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.85rem; font-weight: 700; }
  .badge.pass { color: #1b5e20; background: rgba(46, 125, 50, 0.14); }
  .badge.fail { color: #b71c1c; background: rgba(198, 40, 40, 0.14); }
  .badge.untested { color: #454545; background: #e7e7e7; }
  table { width: 100%; border-collapse: collapse; margin-top: 0.5rem; }
  th, td { text-align: left; padding: 0.6rem 0.75rem; border-bottom: 1px solid #e7e7e7; font-size: 0.92rem; }
  th { font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.04em; color: #6d6d6d; }
  td.tags { font-family: ui-monospace, SFMono-Regular, monospace; font-size: 0.8rem; color: #6d6d6d; }
  td.status { font-weight: 700; }
  tr.status-pass td.status { color: #2e7d32; }
  tr.status-fail td.status { color: #c62828; }
  tr.status-untested td.status { color: #888888; }
</style>
</head>
<body>
  <h1>${escapeHtml(planName)}</h1>
  <p class="meta"><strong>Tested on:</strong> ${generatedAt.toLocaleString()}</p>
  <div class="summary">
    <span class="badge pass">✓ ${passCount} pass</span>
    <span class="badge fail">✕ ${failCount} fail</span>
    <span class="badge untested">${untestedCount} untested</span>
  </div>
${sections}
</body>
</html>
`
}
