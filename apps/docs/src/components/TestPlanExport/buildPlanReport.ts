import {
  type ChecklistState,
  type ChecklistStatus,
  type Scenario,
  scenarioKey,
} from "@site/src/lib/gherkin"

interface PlanFeature {
  featureName: string
  pageUrl: string
  scenarios: Scenario[]
  state: ChecklistState
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

function statusLabel(status: ChecklistStatus): "Pass" | "Fail" | "Untested" {
  if (status === "pass") return "Pass"
  if (status === "fail") return "Fail"
  return "Untested"
}

// Matches GherkinChecklist's own display convention — "@priority-high"
// becomes the filter value "priority-high" and the label "Priority high".
function tagValue(tag: string): string {
  return tag.replace(/^@/, "")
}

function tagLabel(tag: string): string {
  return tagValue(tag).replace(/-/g, " ")
}

// state.*images here are already-resolved data URLs (see
// index.tsx's resolveImages) — this only wraps them in <img> tags.
function renderImages(images: string[], maxSize: number): string {
  if (images.length === 0) return ""
  const tags = images
    .map(
      (src) =>
        `<img src="${escapeHtml(src)}" alt="Attached screenshot" style="max-width:${maxSize}px;max-height:${maxSize}px;" />`
    )
    .join("")
  return `<div class="note-images">${tags}</div>`
}

export function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "plan"
  )
}

export function buildPlanReport({
  planName,
  features,
  generatedAt,
}: BuildPlanReportOptions): string {
  let passCount = 0
  let failCount = 0
  let untestedCount = 0
  const allTags = new Set<string>()

  const sections = features
    .map(({ featureName, pageUrl, scenarios, state }) => {
      const rows = scenarios
        .map((scenario, i) => {
          const result = state.items[scenarioKey(scenario)]
          const label = statusLabel(result?.status ?? null)
          if (label === "Pass") passCount += 1
          else if (label === "Fail") failCount += 1
          else untestedCount += 1
          scenario.tags.forEach((tag) => allTags.add(tag))

          const tagValues = scenario.tags.map(tagValue).join(" ")
          return `      <tr class="status-${label.toLowerCase()}" data-tags="${escapeHtml(tagValues)}">
        <td>${i + 1}</td>
        <td>${escapeHtml(scenario.title)}</td>
        <td class="tags">${escapeHtml(scenario.tags.join(" "))}</td>
        <td class="status">${label}</td>
        <td class="notes">${escapeHtml(result?.comment ?? "")}${renderImages(result?.images ?? [], 140)}</td>
      </tr>`
        })
        .join("\n")

      const generalNote = state.general.trim()

      return `  <section class="feature">
  <h2>${escapeHtml(featureName)}</h2>
  <p class="meta"><a href="${escapeHtml(pageUrl)}">${escapeHtml(pageUrl)}</a></p>${
    generalNote
      ? `\n  <p class="general-note">${escapeHtml(generalNote)}</p>`
      : ""
  }${renderImages(state.generalImages, 200)}
  <table>
    <thead>
      <tr><th>#</th><th>Scenario</th><th>Tags</th><th>Status</th><th>Notes</th></tr>
    </thead>
    <tbody>
${rows}
    </tbody>
  </table>
  </section>`
    })
    .join("\n\n")

  const sortedTags = Array.from(allTags).sort()
  const tagFilter =
    sortedTags.length === 0
      ? ""
      : `  <div class="tag-filter">
    <span class="filter-label">Filter</span>
    <div class="tag-chips" id="tag-chips">
${sortedTags
  .map(
    (tag) =>
      `      <button type="button" class="tag-chip" data-tag="${escapeHtml(tagValue(tag))}">${escapeHtml(tagLabel(tag))}</button>`
  )
  .join("\n")}
    </div>
    <button type="button" class="tag-clear" id="tag-clear" hidden>Clear filter</button>
  </div>`

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
  .general-note { padding: 0.6rem 0.85rem; margin: 0 0 0.75rem; background: #f5f5f5; border-radius: 8px; font-size: 0.88rem; white-space: pre-wrap; }
  .note-images { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 0.4rem; }
  .note-images img { border-radius: 6px; border: 1px solid #e7e7e7; object-fit: cover; }
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
  td.notes { color: #454545; white-space: pre-wrap; }
  tr.status-pass td.status { color: #2e7d32; }
  tr.status-fail td.status { color: #c62828; }
  tr.status-untested td.status { color: #888888; }
  .tag-filter { display: flex; flex-wrap: wrap; align-items: flex-start; gap: 0.6rem; margin: 1rem 0 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid #e7e7e7; }
  .filter-label { flex-shrink: 0; padding-top: 0.3rem; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #6d6d6d; }
  .tag-chips { display: flex; flex-wrap: wrap; gap: 0.4rem; }
  .tag-chip { padding: 0.28rem 0.75rem; font-size: 0.8rem; font-weight: 600; text-transform: capitalize; color: #454545; background: #f0f0f0; border: 1px solid #dcdcdc; border-radius: 999px; cursor: pointer; }
  .tag-chip:hover { background: #e7e7e7; }
  .tag-chip.active { color: #2e7d32; background: rgba(46, 125, 50, 0.12); border: 1.5px solid #2e7d32; font-weight: 700; }
  .tag-clear { flex-shrink: 0; padding-top: 0.3rem; font-size: 0.75rem; font-weight: 600; color: #6d6d6d; background: transparent; border: none; cursor: pointer; text-decoration: underline; }
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
${tagFilter}
${sections}
<script>
(function () {
  var chips = document.querySelectorAll(".tag-chip");
  var sections = document.querySelectorAll(".feature");
  var clearBtn = document.getElementById("tag-clear");
  var active = new Set();

  function applyFilter() {
    sections.forEach(function (section) {
      var rows = section.querySelectorAll("tr[data-tags]");
      var anyVisible = false;
      rows.forEach(function (row) {
        var tags = (row.getAttribute("data-tags") || "").split(" ");
        var show = active.size === 0 || tags.some(function (t) { return active.has(t); });
        row.style.display = show ? "" : "none";
        if (show) anyVisible = true;
      });
      section.style.display = anyVisible ? "" : "none";
    });
    if (clearBtn) clearBtn.hidden = active.size === 0;
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var tag = chip.getAttribute("data-tag");
      if (active.has(tag)) {
        active.delete(tag);
        chip.classList.remove("active");
      } else {
        active.add(tag);
        chip.classList.add("active");
      }
      applyFilter();
    });
  });

  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      active.clear();
      chips.forEach(function (chip) { chip.classList.remove("active"); });
      applyFilter();
    });
  }
})();
</script>
</body>
</html>
`
}
