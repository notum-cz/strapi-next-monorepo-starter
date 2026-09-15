import React, {
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import BrowserOnly from "@docusaurus/BrowserOnly"
import Link from "@docusaurus/Link"
import { usePluginData } from "@docusaurus/useGlobalData"
import clsx from "clsx"

import {
  type ChecklistState,
  type Scenario,
  emptyChecklistState,
  gherkinStorageKey,
  parseChecklistState,
  scenarioKey,
} from "@site/src/lib/gherkin"
import { deleteImage, getImageDataUrl } from "@site/src/lib/imageStore"

import { buildPlanReport, slugify } from "./buildPlanReport"
import styles from "./styles.module.css"

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

function readResults(
  storageKey: string,
  scenarios: Scenario[]
): ChecklistState {
  try {
    return parseChecklistState(
      window.localStorage.getItem(storageKey),
      scenarios
    )
  } catch {
    // localStorage unavailable (private mode, disabled cookies, etc.) —
    // the plan still renders, it just can't read anyone's saved results.
    return emptyChecklistState()
  }
}

// The export is a self-contained downloadable HTML file — it can't rely
// on the exporting browser's IndexedDB being around later, so every image
// id gets resolved to an inlined data URL before buildPlanReport ever
// touches it.
async function resolveImages(state: ChecklistState): Promise<ChecklistState> {
  // A rejected getImageDataUrl() (a transient IndexedDB error, private-mode
  // restrictions, ...) shouldn't cost the whole export — catch it per-image
  // so Promise.all can't abort the entire performExport() over one bad read.
  const resolveIds = async (ids: string[]) => {
    const dataUrls = await Promise.all(
      ids.map((id) => getImageDataUrl(id).catch(() => undefined))
    )
    return dataUrls.filter((url): url is string => !!url)
  }

  const generalImages = await resolveIds(state.generalImages)
  const itemEntries = await Promise.all(
    Object.entries(state.items).map(async ([key, item]) => [
      key,
      { ...item, images: await resolveIds(item.images) },
    ])
  )

  return {
    general: state.general,
    generalImages,
    items: Object.fromEntries(itemEntries),
  }
}

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

/**
 * Focus handling for the export/reset confirm dialogs: moves focus into
 * the dialog when it opens, traps Tab/Shift+Tab inside it while open, and
 * restores focus to whatever triggered it (the Export/Reset button) once
 * it closes — without this, a keyboard user tabbing through the page
 * while the dialog is open lands on background controls it shouldn't.
 */
function useDialogFocus(open: boolean) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<Element | null>(null)

  useEffect(() => {
    if (!open) return

    triggerRef.current = document.activeElement
    dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || !dialogRef.current) return

      const focusables = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      )
      if (focusables.length === 0) return

      const first = focusables[0]
      const last = focusables[focusables.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      if (triggerRef.current instanceof HTMLElement) {
        triggerRef.current.focus()
      }
    }
  }, [open])

  return dialogRef
}

// Pass/fail counts alone understate what Reset would destroy — a
// scenario can carry a comment or attached screenshots while still
// sitting "untested" (no Pass/Fail clicked), and the general note/images
// aren't tied to any scenario at all. Anything here is state a tester
// would lose without warning if Reset skipped confirmation.
function hasAnyData(state: ChecklistState): boolean {
  if (state.general.trim() || state.generalImages.length > 0) return true
  return Object.values(state.items).some(
    (item) =>
      item.status !== null ||
      item.comment.trim() !== "" ||
      item.images.length > 0
  )
}

function countStatuses(scenarios: Scenario[], state: ChecklistState) {
  let pass = 0
  let fail = 0
  scenarios.forEach((scenario) => {
    const status = state.items[scenarioKey(scenario)]?.status
    if (status === "pass") pass += 1
    else if (status === "fail") fail += 1
  })
  return { pass, fail, untested: scenarios.length - pass - fail }
}

function ExportImpl({
  planId,
  planName,
  pages,
}: TestPlanExportProps): ReactNode {
  const manifest = usePluginData("test-plan-manifest") as TestPlanManifest
  const entries = useMemo(
    () =>
      pages
        ? manifest.filter((entry) => pages.includes(entry.pageId))
        : manifest,
    [manifest, pages]
  )

  const [resultsByEntry, setResultsByEntry] = useState<ChecklistState[]>([])

  useEffect(() => {
    setResultsByEntry(
      entries.map((entry) =>
        readResults(
          gherkinStorageKey(entry.path, entry.blockIndex),
          entry.scenarios
        )
      )
    )
  }, [entries])

  const totals = entries.reduce(
    (acc, entry, i) => {
      const counts = countStatuses(
        entry.scenarios,
        resultsByEntry[i] ?? emptyChecklistState()
      )
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
  const exportDialogRef = useDialogFocus(exportConfirmOpen)
  const resetDialogRef = useDialogFocus(resetConfirmOpen)

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

  const performExport = async () => {
    const generatedAt = new Date()
    const resolvedStates = await Promise.all(
      entries.map((_, i) =>
        resolveImages(resultsByEntry[i] ?? emptyChecklistState())
      )
    )
    const html = buildPlanReport({
      planName: planName ?? planId,
      features: entries.map((entry, i) => ({
        featureName: entry.featureName,
        pageUrl: `${window.location.origin}${entry.path}`,
        scenarios: entry.scenarios,
        state: resolvedStates[i],
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
      void performExport()
    }
  }

  const confirmExport = () => {
    setExportConfirmOpen(false)
    void performExport()
  }

  const performReset = () => {
    const imageIds = resultsByEntry.flatMap((state) => [
      ...state.generalImages,
      ...Object.values(state.items).flatMap((item) => item.images),
    ])
    entries.forEach((entry) => {
      try {
        window.localStorage.removeItem(
          gherkinStorageKey(entry.path, entry.blockIndex)
        )
      } catch {
        // ignore — see readResults
      }
    })
    setResultsByEntry(entries.map(() => emptyChecklistState()))
    imageIds.forEach((id) => void deleteImage(id))
  }

  const handleResetClick = () => {
    if (resultsByEntry.some(hasAnyData)) {
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
          <button
            type="button"
            className={styles.export}
            onClick={handleExportClick}
          >
            Export results
          </button>
          <button
            type="button"
            className={styles.export}
            onClick={handleResetClick}
          >
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
          const counts = countStatuses(
            entry.scenarios,
            resultsByEntry[i] ?? emptyChecklistState()
          )
          return (
            <li
              key={`${entry.pageId}:${entry.blockIndex}`}
              className={styles.item}
            >
              <Link to={entry.path} className={styles.featureLink}>
                {entry.featureName}
              </Link>
              <span className={styles.itemCounts}>
                <span className={styles.passCount}>{counts.pass} pass</span>
                <span className={styles.failCount}>{counts.fail} fail</span>
                <span className={styles.untestedCount}>
                  {counts.untested} untested
                </span>
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
            ref={exportDialogRef}
            className={styles.dialog}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="test-plan-export-confirm-title"
            onClick={(event) => event.stopPropagation()}
          >
            <p
              id="test-plan-export-confirm-title"
              className={styles.dialogText}
            >
              {totals.untested} scenario{totals.untested === 1 ? "" : "s"} still
              untested. Export anyway?
            </p>
            <div className={styles.dialogActions}>
              <button
                type="button"
                className={styles.export}
                onClick={() => setExportConfirmOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.exportConfirm}
                onClick={confirmExport}
              >
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
            ref={resetDialogRef}
            className={styles.dialog}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="test-plan-reset-confirm-title"
            onClick={(event) => event.stopPropagation()}
          >
            <p id="test-plan-reset-confirm-title" className={styles.dialogText}>
              This clears every saved result, note, and screenshot for this plan
              ({totals.pass} pass, {totals.fail} fail back to untested). This
              can't be undone. Reset anyway?
            </p>
            <div className={styles.dialogActions}>
              <button
                type="button"
                className={styles.export}
                onClick={() => setResetConfirmOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.resetConfirm}
                onClick={confirmReset}
              >
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
