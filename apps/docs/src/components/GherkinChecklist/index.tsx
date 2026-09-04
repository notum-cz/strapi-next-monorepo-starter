import React, { type ReactNode, useEffect, useMemo, useState } from "react"
import BrowserOnly from "@docusaurus/BrowserOnly"
import { useLocation } from "@docusaurus/router"
import clsx from "clsx"

import styles from "./styles.module.css"

interface Scenario {
  type: string
  title: string
  tags: string[]
}

type Status = "pass" | "fail" | null

type Results = Record<number, Status>

interface GherkinChecklistProps {
  scenarios: string
  blockIndex: string
}

function readResults(storageKey: string): Results {
  try {
    const raw = window.localStorage.getItem(storageKey)
    return raw ? JSON.parse(raw) : {}
  } catch {
    // localStorage unavailable (private mode, disabled cookies, etc.) —
    // the checklist still renders, it just won't persist between visits.
    return {}
  }
}

function ChecklistImpl({ scenarios, blockIndex }: GherkinChecklistProps): ReactNode {
  const parsed = useMemo<Scenario[]>(() => JSON.parse(scenarios), [scenarios])
  const { pathname } = useLocation()
  const storageKey = `gherkin-checklist:${pathname}:${blockIndex}`

  const [results, setResults] = useState<Results>({})

  useEffect(() => {
    setResults(readResults(storageKey))
  }, [storageKey])

  const persist = (next: Results) => {
    setResults(next)
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(next))
    } catch {
      // ignore — see readResults
    }
  }

  const setStatus = (i: number, status: Status) =>
    persist({ ...results, [i]: results[i] === status ? null : status })

  const reset = () => {
    setResults({})
    try {
      window.localStorage.removeItem(storageKey)
    } catch {
      // ignore — see readResults
    }
  }

  const passCount = Object.values(results).filter((s) => s === "pass").length
  const failCount = Object.values(results).filter((s) => s === "fail").length
  const untestedCount = parsed.length - passCount - failCount

  return (
    <div className={styles.checklist}>
      <div className={styles.header}>
        <span className={styles.summary}>
          <span className={clsx(styles.badge, styles.passBadge)}>
            ✓ {passCount} pass
          </span>
          <span className={clsx(styles.badge, styles.failBadge)}>
            ✕ {failCount} fail
          </span>
          <span className={clsx(styles.badge, styles.untestedBadge)}>
            {untestedCount} untested
          </span>
        </span>
        <button type="button" className={styles.reset} onClick={reset}>
          Reset
        </button>
      </div>
      <div className={styles.progressBar}>
        <span
          className={styles.progressPass}
          style={{ width: `${(passCount / parsed.length) * 100}%` }}
        />
        <span
          className={styles.progressFail}
          style={{ width: `${(failCount / parsed.length) * 100}%` }}
        />
      </div>
      <ul className={styles.list}>
        {parsed.map((scenario, i) => (
          <li key={i} className={styles.item}>
            <span className={styles.itemLabel}>
              <span className={styles.title}>{scenario.title}</span>
              {scenario.tags.length > 0 && (
                <span className={styles.tags}>{scenario.tags.join(" ")}</span>
              )}
            </span>
            <span className={styles.actions}>
              <button
                type="button"
                aria-pressed={results[i] === "pass"}
                className={clsx(
                  styles.statusButton,
                  styles.pass,
                  results[i] === "pass" && styles.active
                )}
                onClick={() => setStatus(i, "pass")}
              >
                ✓ Pass
              </button>
              <button
                type="button"
                aria-pressed={results[i] === "fail"}
                className={clsx(
                  styles.statusButton,
                  styles.fail,
                  results[i] === "fail" && styles.active
                )}
                onClick={() => setStatus(i, "fail")}
              >
                ✕ Fail
              </button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function GherkinChecklist(props: GherkinChecklistProps): ReactNode {
  return <BrowserOnly>{() => <ChecklistImpl {...props} />}</BrowserOnly>
}
