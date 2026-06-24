import { Button } from "@strapi/design-system"
import {
  getFetchClient,
  unstable_useContentManagerContext,
  useNotification,
  useQueryParams,
} from "@strapi/strapi/admin"
import { useMemo, useState } from "react"

type ContentManagerContext = {
  model?: string
  uid?: string
  form?: {
    values?: Record<string, unknown>
    initialValues?: Record<string, unknown>
  }
}

const parseString = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null
  }

  const normalized = value.trim()

  return normalized.length > 0 ? normalized : null
}

const REVALIDATE_LABEL = "Revalidate cache"

type RevalidateContext = {
  uid: string
  fullPath: string | null
  locale: string | null
}

type RevalidateAction = {
  label: string
  successMessage: string
  errorMessage: string
  payload: Record<string, unknown>
}

const tagBasedAction =
  (name: string) =>
  ({ uid }: RevalidateContext): RevalidateAction => ({
    label: REVALIDATE_LABEL,
    successMessage: `Revalidated ${name} cache.`,
    errorMessage: `Failed to revalidate ${name} cache.`,
    // Built inline rather than via the shared `strapiCacheTag`: this runs in
    // the Vite-built admin bundle, which cannot consume @repo/shared-data's
    // CommonJS build as ESM named imports. The revalidate service re-derives
    // and dedupes this canonical tag server-side anyway.
    payload: { uid, tags: [`strapi:${uid}`] },
  })

const REVALIDATE_CONFIG: Record<
  string,
  (ctx: RevalidateContext) => RevalidateAction | null
> = {
  "api::page.page": ({ uid, fullPath, locale }) => {
    if (!fullPath) {
      return null
    }

    return {
      label: REVALIDATE_LABEL,
      successMessage: `Revalidated page cache at "${fullPath}".`,
      errorMessage: "Failed to revalidate page cache.",
      payload: locale
        ? { uid, fullPaths: [fullPath], locale }
        : { uid, fullPaths: [fullPath] },
    }
  },
  "api::navbar.navbar": tagBasedAction("navbar"),
  "api::footer.footer": tagBasedAction("footer"),
}

function DataRevalidateButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [{ query }] = useQueryParams<{
    showRevalidateCache?: unknown
    locale?: unknown
    plugins?: { i18n?: { locale?: unknown } }
  }>()
  const { post } = getFetchClient()
  const { toggleNotification } = useNotification()
  const ctx = unstable_useContentManagerContext() as ContentManagerContext
  const uid = parseString(ctx?.model ?? ctx?.uid)
  const shouldShowButton = parseString(query?.showRevalidateCache) === "true"

  const fullPath = useMemo(() => {
    const values = ctx?.form?.values ?? ctx?.form?.initialValues

    return parseString(values?.fullPath)
  }, [ctx?.form?.initialValues, ctx?.form?.values])

  const locale = useMemo(() => {
    return (
      parseString(query?.plugins?.i18n?.locale) ?? parseString(query?.locale)
    )
  }, [query])

  const action = useMemo(() => {
    if (!uid) {
      return null
    }

    return REVALIDATE_CONFIG[uid]?.({ uid, fullPath, locale }) ?? null
  }, [fullPath, locale, uid])

  if (!shouldShowButton || !action) {
    return null
  }

  const runRevalidate = async () => {
    if (isLoading) {
      return
    }

    setIsLoading(true)

    try {
      await post("/api/revalidate", action.payload)
      toggleNotification({
        type: "success",
        message: action.successMessage,
      })
    } catch (error) {
      console.error(`Failed to revalidate cache for ${uid}:`, error)
      toggleNotification({
        type: "danger",
        message: action.errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="danger-light"
      fullWidth
      onClick={runRevalidate}
      loading={isLoading}
      disabled={isLoading}
    >
      {action.label}
    </Button>
  )
}

export default DataRevalidateButton
