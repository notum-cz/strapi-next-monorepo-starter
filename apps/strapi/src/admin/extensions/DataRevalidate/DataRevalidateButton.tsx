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

function DataRevalidateButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [{ query }] = useQueryParams<{
    locale?: unknown
    plugins?: { i18n?: { locale?: unknown } }
  }>()
  const { post } = getFetchClient()
  const { toggleNotification } = useNotification()
  const ctx = unstable_useContentManagerContext() as ContentManagerContext
  const uid = parseString(ctx?.model ?? ctx?.uid)

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

    if (uid === "api::page.page") {
      if (!fullPath) {
        return null
      }

      return {
        label: "Revalidate cache",
        successMessage: `Revalidated page cache at "${fullPath}".`,
        errorMessage: "Failed to revalidate page cache.",
        payload: {
          uid,
          fullPaths: [fullPath],
          locale,
        },
      }
    }

    if (uid === "api::navbar.navbar") {
      return {
        label: "Revalidate cache",
        successMessage: "Revalidated navbar cache.",
        errorMessage: "Failed to revalidate navbar cache.",
        payload: { uid, tags: [`strapi:${uid}`] },
      }
    }

    if (uid === "api::footer.footer") {
      return {
        label: "Revalidate cache",
        successMessage: "Revalidated footer cache.",
        errorMessage: "Failed to revalidate footer cache.",
        payload: { uid, tags: [`strapi:${uid}`] },
      }
    }

    return null
  }, [fullPath, locale, uid])

  if (!action) {
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
