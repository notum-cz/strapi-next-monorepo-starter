import React, {
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import BrowserOnly from "@docusaurus/BrowserOnly"
import { useLocation } from "@docusaurus/router"
import clsx from "clsx"

import {
  type ChecklistState,
  type ChecklistStatus,
  type Scenario,
  emptyChecklistState,
  gherkinStorageKey,
  parseChecklistState,
  scenarioKey,
} from "@site/src/lib/gherkin"
import { deleteImage, getImageBlob, saveImage } from "@site/src/lib/imageStore"

import styles from "./styles.module.css"

interface GherkinChecklistProps {
  scenarios: string
  blockIndex: string
}

function useImageObjectUrl(id: string): string | undefined {
  const [url, setUrl] = useState<string>()

  useEffect(() => {
    let cancelled = false
    let objectUrl: string | undefined

    getImageBlob(id)
      .then((blob) => {
        if (cancelled || !blob) return
        objectUrl = URL.createObjectURL(blob)
        setUrl(objectUrl)
      })
      .catch(() => {
        // ignore — IndexedDB unavailable or the record is gone; the
        // thumbnail just won't render.
      })

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [id])

  return url
}

function ImageThumb({
  id,
  onRemove,
}: {
  id: string
  onRemove: () => void
}): ReactNode {
  const url = useImageObjectUrl(id)
  if (!url) return null

  return (
    <div className={styles.thumb}>
      <a href={url} target="_blank" rel="noreferrer">
        <img src={url} alt="Attached screenshot" />
      </a>
      <button
        type="button"
        className={styles.thumbRemove}
        aria-label="Remove image"
        onClick={onRemove}
      >
        ×
      </button>
    </div>
  )
}

interface NoteFieldProps {
  value: string
  onChange: (value: string) => void
  placeholder: string
  className: string
  images: string[]
  onAddImage: (id: string) => void
  onRemoveImage: (id: string) => void
}

// A plain <input> can't hold a line break or a "- " bullet the tester types
// — this grows with its content instead, so Enter behaves like it would in
// any normal notes app. It also accepts screenshots — pasted straight from
// the clipboard or attached from disk — stored via imageStore.ts so they
// don't blow through localStorage's much smaller quota.
function NoteField({
  value,
  onChange,
  placeholder,
  className,
  images,
  onAddImage,
  onRemoveImage,
}: NoteFieldProps): ReactNode {
  const ref = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${el.scrollHeight}px`
  }, [value])

  const attachFiles = async (files: File[]) => {
    for (const file of files) {
      if (!file.type.startsWith("image/")) continue
      try {
        const id = await saveImage(file)
        onAddImage(id)
      } catch {
        // ignore — IndexedDB unavailable, quota exceeded, or the image
        // failed to decode; the note's text still saves fine either way.
      }
    }
  }

  const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const files = Array.from(event.clipboardData?.items ?? [])
      .filter((item) => item.kind === "file" && item.type.startsWith("image/"))
      .map((item) => item.getAsFile())
      .filter((file): file is File => file !== null)

    if (files.length === 0) return
    event.preventDefault()
    void attachFiles(files)
  }

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ""
    void attachFiles(files)
  }

  return (
    <div className={styles.noteField}>
      <textarea
        ref={ref}
        rows={1}
        className={className}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onPaste={handlePaste}
      />
      <button
        type="button"
        className={styles.attachButton}
        onClick={() => fileInputRef.current?.click()}
      >
        📎 Attach screenshot
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className={styles.fileInput}
        onChange={handleFileInput}
      />
      {images.length > 0 && (
        <div className={styles.thumbRow}>
          {images.map((id) => (
            <ImageThumb key={id} id={id} onRemove={() => onRemoveImage(id)} />
          ))}
        </div>
      )}
    </div>
  )
}

function ChecklistImpl({
  scenarios,
  blockIndex,
}: GherkinChecklistProps): ReactNode {
  const parsed = useMemo<Scenario[]>(() => JSON.parse(scenarios), [scenarios])
  const { pathname } = useLocation()
  const storageKey = gherkinStorageKey(pathname, blockIndex)

  const [state, setState] = useState<ChecklistState>(emptyChecklistState)

  useEffect(() => {
    try {
      setState(
        parseChecklistState(window.localStorage.getItem(storageKey), parsed)
      )
    } catch {
      // localStorage unavailable (private mode, disabled cookies, etc.) —
      // the checklist still renders, it just won't persist between visits.
      setState(emptyChecklistState())
    }
  }, [storageKey, parsed])

  const persist = (next: ChecklistState) => {
    setState(next)
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(next))
    } catch {
      // ignore — see above
    }
  }

  const setStatus = (key: string, status: ChecklistStatus) =>
    persist({
      ...state,
      items: {
        ...state.items,
        [key]: {
          comment: state.items[key]?.comment ?? "",
          images: state.items[key]?.images ?? [],
          status: state.items[key]?.status === status ? null : status,
        },
      },
    })

  const setComment = (key: string, comment: string) =>
    persist({
      ...state,
      items: {
        ...state.items,
        [key]: {
          status: state.items[key]?.status ?? null,
          images: state.items[key]?.images ?? [],
          comment,
        },
      },
    })

  const addImage = (key: string, id: string) =>
    persist({
      ...state,
      items: {
        ...state.items,
        [key]: {
          status: state.items[key]?.status ?? null,
          comment: state.items[key]?.comment ?? "",
          images: [...(state.items[key]?.images ?? []), id],
        },
      },
    })

  const removeImage = (key: string, id: string) => {
    const existing = state.items[key]
    if (!existing) return
    persist({
      ...state,
      items: {
        ...state.items,
        [key]: {
          ...existing,
          images: existing.images.filter((imageId) => imageId !== id),
        },
      },
    })
    void deleteImage(id)
  }

  const setGeneral = (general: string) => persist({ ...state, general })

  const addGeneralImage = (id: string) =>
    persist({ ...state, generalImages: [...state.generalImages, id] })

  const removeGeneralImage = (id: string) => {
    persist({
      ...state,
      generalImages: state.generalImages.filter((imageId) => imageId !== id),
    })
    void deleteImage(id)
  }

  const reset = () => {
    const imageIds = [
      ...state.generalImages,
      ...Object.values(state.items).flatMap((item) => item.images),
    ]
    setState(emptyChecklistState())
    try {
      window.localStorage.removeItem(storageKey)
    } catch {
      // ignore — see above
    }
    imageIds.forEach((id) => void deleteImage(id))
  }

  // Read through scenarioKey() rather than Object.values(state.items) so a
  // stale entry (from a scenario that no longer exists) can't inflate the
  // counts — only results matched to the checklist's current scenarios
  // count.
  const currentResults = parsed.map(
    (scenario) => state.items[scenarioKey(scenario)]
  )
  const passCount = currentResults.filter((r) => r?.status === "pass").length
  const failCount = currentResults.filter((r) => r?.status === "fail").length
  const untestedCount = parsed.length - passCount - failCount

  const allTags = useMemo(() => {
    const tags = new Set<string>()
    parsed.forEach((scenario) => scenario.tags.forEach((tag) => tags.add(tag)))
    return Array.from(tags).sort()
  }, [parsed])

  const [activeTags, setActiveTags] = useState<Set<string>>(new Set())

  const toggleTag = (tag: string) =>
    setActiveTags((prev) => {
      const next = new Set(prev)
      if (next.has(tag)) next.delete(tag)
      else next.add(tag)
      return next
    })

  // Filtering only changes which rows render — the badges/progress bar
  // above always reflect every scenario, so a narrowed view can't be
  // mistaken for the checklist's actual pass/fail health.
  const visibleIndices = parsed
    .map((_, i) => i)
    .filter(
      (i) =>
        activeTags.size === 0 ||
        parsed[i].tags.some((tag) => activeTags.has(tag))
    )

  const hasContent = (item?: { comment: string; images: string[] }) =>
    Boolean(item?.comment.trim()) || (item?.images.length ?? 0) > 0

  // Each note is a small accordion: it starts collapsed unless it already
  // has content, but the tester can toggle it open or closed either way —
  // `undefined` means "no explicit choice yet, fall back to whether there's
  // content", `true`/`false` is the tester overriding that default.
  const generalHasContent =
    Boolean(state.general.trim()) || state.generalImages.length > 0
  const [generalOverride, setGeneralOverride] = useState<boolean | undefined>(
    undefined
  )
  const isGeneralOpen = generalOverride ?? generalHasContent
  const toggleGeneral = () => setGeneralOverride(!isGeneralOpen)

  const [noteOverrides, setNoteOverrides] = useState<Record<number, boolean>>(
    {}
  )
  // Keyed by render index (i), not scenarioKey — this is ephemeral,
  // session-only UI state (which accordions the tester has toggled), not
  // persisted data, so it doesn't need scenario-identity stability.
  const isNoteOpen = (i: number, key: string) =>
    noteOverrides[i] ?? hasContent(state.items[key])
  const toggleNote = (i: number, key: string) =>
    setNoteOverrides((prev) => ({ ...prev, [i]: !isNoteOpen(i, key) }))

  return (
    <div className={styles.checklist}>
      <div className={styles.statusSection}>
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
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>Overall notes</span>
          <button
            type="button"
            className={styles.noteToggle}
            aria-expanded={isGeneralOpen}
            onClick={toggleGeneral}
          >
            {isGeneralOpen
              ? "Hide"
              : generalHasContent
                ? "Show note"
                : "+ Add note"}
          </button>
        </div>
        {isGeneralOpen && (
          <NoteField
            className={styles.generalComment}
            placeholder="Add a note..."
            value={state.general}
            onChange={setGeneral}
            images={state.generalImages}
            onAddImage={addGeneralImage}
            onRemoveImage={removeGeneralImage}
          />
        )}
      </div>

      {allTags.length > 0 && (
        <div className={clsx(styles.section, styles.tagFilter)}>
          <span className={styles.sectionLabel}>Filter</span>
          <div className={styles.tagChips}>
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                aria-pressed={activeTags.has(tag)}
                className={clsx(
                  styles.tagChip,
                  activeTags.has(tag) && styles.tagChipActive
                )}
                onClick={() => toggleTag(tag)}
              >
                {activeTags.has(tag) && "✓ "}
                {tag.replace(/^@/, "").replace(/-/g, " ")}
              </button>
            ))}
          </div>
          {activeTags.size > 0 && (
            <button
              type="button"
              className={styles.tagClear}
              onClick={() => setActiveTags(new Set())}
            >
              Clear filter
            </button>
          )}
        </div>
      )}

      <ul className={styles.list}>
        {visibleIndices.length === 0 && (
          <li className={styles.empty}>
            No scenarios match the selected tags.
          </li>
        )}
        {visibleIndices.map((i) => {
          const scenario = parsed[i]
          const key = scenarioKey(scenario)
          const open = isNoteOpen(i, key)
          const noteHasContent = hasContent(state.items[key])
          return (
            <li key={key} className={styles.item}>
              <div className={styles.itemRow}>
                <div className={styles.itemText}>
                  <span className={styles.title}>{scenario.title}</span>
                  {scenario.tags.length > 0 && (
                    <span className={styles.tags}>
                      {scenario.tags.map((tag) => (
                        <span key={tag} className={styles.tagBadge}>
                          {tag.replace(/^@/, "").replace(/-/g, " ")}
                        </span>
                      ))}
                    </span>
                  )}
                </div>
                <div className={styles.itemRight}>
                  <span className={styles.actions}>
                    <button
                      type="button"
                      aria-pressed={state.items[key]?.status === "pass"}
                      className={clsx(
                        styles.statusButton,
                        styles.pass,
                        state.items[key]?.status === "pass" && styles.active
                      )}
                      onClick={() => setStatus(key, "pass")}
                    >
                      ✓ Pass
                    </button>
                    <button
                      type="button"
                      aria-pressed={state.items[key]?.status === "fail"}
                      className={clsx(
                        styles.statusButton,
                        styles.fail,
                        state.items[key]?.status === "fail" && styles.active
                      )}
                      onClick={() => setStatus(key, "fail")}
                    >
                      ✕ Fail
                    </button>
                  </span>
                  <button
                    type="button"
                    className={styles.noteToggle}
                    aria-expanded={open}
                    onClick={() => toggleNote(i, key)}
                  >
                    {open ? "Hide" : noteHasContent ? "Show note" : "+ Note"}
                  </button>
                </div>
              </div>
              {open && (
                <NoteField
                  className={styles.comment}
                  placeholder="Add a note…"
                  value={state.items[key]?.comment ?? ""}
                  onChange={(comment) => setComment(key, comment)}
                  images={state.items[key]?.images ?? []}
                  onAddImage={(id) => addImage(key, id)}
                  onRemoveImage={(id) => removeImage(key, id)}
                />
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default function GherkinChecklist(
  props: GherkinChecklistProps
): ReactNode {
  return <BrowserOnly>{() => <ChecklistImpl {...props} />}</BrowserOnly>
}
