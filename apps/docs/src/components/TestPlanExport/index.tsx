import React, { type ReactNode, useEffect, useMemo, useState } from "react"
import BrowserOnly from "@docusaurus/BrowserOnly"
import Link from "@docusaurus/Link"
import { usePluginData } from "@docusaurus/useGlobalData"
import clsx from "clsx"

import { buildPlanReport, slugify } from "./buildPlanReport"
import styles from "./styles.module.css"

interface Scenario {
  type: string
  title: string
  tags: string[]
}

type Status = "pass" | "fail" | null

type Results = Record<number, Status>

interface ManifestEntry {
  pageId: string
  path: string
  featureName: string
  blockIndex: number
  scenarios: Scenario[]
}

type TestPlanManifest = ManifestEntry[]

interface TestPlanExportProps {
  planId: string
  planName?: string
  /** pageIds to include (a page's filename under test-cases/, without
   * extension). Omit to cover every page in the manifest. */
  pages?: string[]
}

function readResults(storageKey: string): Results {
  try {
    const raw = window.localStorage.getItem(storageKey)
    return raw ? JSON.parse(raw) : {}
  } catch {
    // localStorage unavailable (private mode, disabled cookies, etc.) —
    // the plan still renders, it just can't read anyone's saved results.
    return {}
  }
}

function countStatuses(scenarios: Scenario[], results: Results) {
  let pass = 0
  let fail = 0
  scenarios.forEach((_, i) => {
    if (results[i] === "pass") pass += 1
    else if (results[i] === "fail") fail += 1
  })
  return { pass, fail, untested: scenarios.length - pass - fail }
}

function ExportImpl({ planId, planName, pages }: TestPlanExportProps): ReactNode {
  const manifest = usePluginData("test-plan-manifest") as TestPlanManifest
  const entries = useMemo(
    () => (pages ? manifest.filter((entry) => pages.includes(entry.pageId)) : manifest),
    [manifest, pages]
  )

  const [resultsByEntry, setResultsByEntry] = useState<Results[]>([])

  useEffect(() => {
    setResultsByEntry(
      entries.map((entry) => readResults(`gherkin-checklist:${entry.path}:${entry.blockIndex}`))
    )
  }, [entries])

  const totals = entries.reduce(
    (acc, entry, i) => {
      const counts = countStatuses(entry.scenarios, resultsByEntry[i] ?? {})
      return {
        pass: acc.pass + counts.pass,
        fail: acc.fail + counts.fail,
        untested: acc.untested + counts.untested,
      }
    },
    { pass: 0, fail: 0, untested: 0 }
  )
  const total = totals.pass + totals.fail + totals.untested

  const [exportConfirmOpen, setExportConfirmOpen] = useState(false)
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false)

  useEffect(() => {
    if (!exportConfirmOpen && !resetConfirmOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setExportConfirmOpen(false)
        setResetConfirmOpen(false)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [exportConfirmOpen, resetConfirmOpen])

  const performExport = () => {
    const generatedAt = new Date()
    const html = buildPlanReport({
      planName: planName ?? planId,
      features: entries.map((entry, i) => ({
        featureName: entry.featureName,
        pageUrl: `${window.location.origin}${entry.path}`,
        scenarios: entry.scenarios,
        results: resultsByEntry[i] ?? {},
      })),
      generatedAt,
    })

    const blob = new Blob([html], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `test-results-${slugify(planName ?? planId)}-${generatedAt.toISOString().slice(0, 10)}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleExportClick = () => {
    if (totals.untested > 0) {
      setExportConfirmOpen(true)
    } else {
      performExport()
    }
  }

  const confirmExport = () => {
    setExportConfirmOpen(false)
    performExport()
  }

  const performReset = () => {
    entries.forEach((entry) => {
      try {
        window.localStorage.removeItem(`gherkin-checklist:${entry.path}:${entry.blockIndex}`)
      } catch {
        // ignore — see readResults
      }
    })
    setResultsByEntry(entries.map(() => ({})))
  }

  const handleResetClick = () => {
    if (totals.pass + totals.fail > 0) {
      setResetConfirmOpen(true)
    } else {
      performReset()
    }
  }

  const confirmReset = () => {
    setResetConfirmOpen(false)
    performReset()
  }

  if (entries.length === 0) {
    return <p className={styles.empty}>No manual test cases found yet.</p>
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.summary}>
          <span className={clsx(styles.badge, styles.passBadge)}>
            ✓ {totals.pass} pass
          </span>
          <span className={clsx(styles.badge, styles.failBadge)}>
            ✕ {totals.fail} fail
          </span>
          <span className={clsx(styles.badge, styles.untestedBadge)}>
            {totals.untested} untested
          </span>
        </span>
        <span className={styles.headerActions}>
          <button type="button" className={styles.export} onClick={handleExportClick}>
            Export results
          </button>
          <button type="button" className={styles.export} onClick={handleResetClick}>
            Reset
          </button>
        </span>
      </div>
      <div className={styles.progressBar}>
        <span
          className={styles.progressPass}
          style={{ width: `${total === 0 ? 0 : (totals.pass / total) * 100}%` }}
        />
        <span
          className={styles.progressFail}
          style={{ width: `${total === 0 ? 0 : (totals.fail / total) * 100}%` }}
        />
      </div>
      <ul className={styles.list}>
        {entries.map((entry, i) => {
          const counts = countStatuses(entry.scenarios, resultsByEntry[i] ?? {})
          return (
            <li key={`${entry.pageId}:${entry.blockIndex}`} className={styles.item}>
              <Link to={entry.path} className={styles.featureLink}>
                {entry.featureName}
              </Link>
              <span className={styles.itemCounts}>
                <span className={styles.passCount}>{counts.pass} pass</span>
                <span className={styles.failCount}>{counts.fail} fail</span>
                <span className={styles.untestedCount}>{counts.untested} untested</span>
              </span>
            </li>
          )
        })}
      </ul>
      {exportConfirmOpen && (
        <div
          className={styles.overlay}
          onClick={() => setExportConfirmOpen(false)}
          role="presentation"
        >
          <div
            className={styles.dialog}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="test-plan-export-confirm-title"
            onClick={(event) => event.stopPropagation()}
          >
            <p id="test-plan-export-confirm-title" className={styles.dialogText}>
              {totals.untested} scenario{totals.untested === 1 ? "" : "s"} still untested.
              Export anyway?
            </p>
            <div className={styles.dialogActions}>
              <button
                type="button"
                className={styles.export}
                onClick={() => setExportConfirmOpen(false)}
              >
                Cancel
              </button>
              <button type="button" className={styles.exportConfirm} onClick={confirmExport}>
                Export anyway
              </button>
            </div>
          </div>
        </div>
      )}
      {resetConfirmOpen && (
        <div
          className={styles.overlay}
          onClick={() => setResetConfirmOpen(false)}
          role="presentation"
        >
          <div
            className={styles.dialog}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="test-plan-reset-confirm-title"
            onClick={(event) => event.stopPropagation()}
          >
            <p id="test-plan-reset-confirm-title" className={styles.dialogText}>
              This clears {totals.pass + totals.fail} result
              {totals.pass + totals.fail === 1 ? "" : "s"} ({totals.pass} pass, {totals.fail} fail)
              back to untested. This can't be undone. Reset anyway?
            </p>
            <div className={styles.dialogActions}>
              <button
                type="button"
                className={styles.export}
                onClick={() => setResetConfirmOpen(false)}
              >
                Cancel
              </button>
              <button type="button" className={styles.resetConfirm} onClick={confirmReset}>
                Reset anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function TestPlanExport(props: TestPlanExportProps): ReactNode {
  return <BrowserOnly>{() => <ExportImpl {...props} />}</BrowserOnly>
}
