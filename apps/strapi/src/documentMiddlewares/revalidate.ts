import type { Core, UID } from "@strapi/strapi"

import { logError, logger } from "../utils/logging"

type RevalidateMode = "path-revalidate" | "tag-revalidate"
type RevalidatePolicy = "publish-only" | "all-writes"

type RevalidateCollectionConfig = {
  uid: UID.ContentType
  mode: RevalidateMode
  policy?: RevalidatePolicy
  pathField?: string
  tags?: string[]
}

const REVALIDATE_COLLECTIONS: RevalidateCollectionConfig[] = [
  {
    uid: "api::page.page",
    mode: "path-revalidate",
    pathField: "fullPath",
  },
  { uid: "api::navbar.navbar", mode: "tag-revalidate" },
  { uid: "api::footer.footer", mode: "tag-revalidate" },
  {
    uid: "api::redirect.redirect",
    mode: "path-revalidate",
    pathField: "source",
  },
  // Add your own collections here, e.g.:
  // { uid: "api::blog-article.blog-article", mode: "path-revalidate", pathField: "fullPath" },
  // { uid: "api::announcement.announcement", mode: "tag-revalidate" },
]

const REVALIDATE_BY_UID = new Map(
  REVALIDATE_COLLECTIONS.map((collection) => [collection.uid, collection])
)

/**
 * Document Service middleware for automatic frontend cache revalidation.
 */
export const registerAutoRevalidateMiddleware = ({
  strapi,
}: {
  strapi: Core.Strapi
}) => {
  strapi.documents.use(async (context, next) => {
    const uid = context.uid
    const config = uid ? REVALIDATE_BY_UID.get(uid) : undefined

    if (!uid || !config) {
      return next()
    }

    const params = toRecord(context.params) ?? {}
    const data = toRecord(params.data)

    // The hierarchy recalculation writes documents with `updatedBy: null`.
    // Skip middleware-level revalidation to avoid duplicate calls — the
    // hierarchy service revalidates the touched paths once per batch.
    if (
      (context.action === "create" || context.action === "update") &&
      data?.updatedBy === null
    ) {
      logger.debug("Auto revalidation skipped for internal hierarchy write", {
        uid,
      })

      return next()
    }

    const nextResult = await next()
    const effectiveResult = unwrapDocumentResult(nextResult, params.locale)
    const action = context.action
    const locale =
      getString(effectiveResult?.locale) ?? getString(params.locale)
    const status =
      getString(effectiveResult?.status) ?? getString(params.status)
    const hasDraftAndPublish =
      context.contentType?.options?.draftAndPublish === true

    if (!shouldRevalidate(action, status, hasDraftAndPublish, config.policy)) {
      return nextResult
    }
    const revalidateService = strapi.service("api::revalidate.revalidate")

    try {
      if (config.mode === "tag-revalidate") {
        await revalidateService.run({ uid, tags: config.tags })

        return nextResult
      }

      const pathField = config.pathField ?? "fullPath"
      const fullPath = getString(effectiveResult?.[pathField])

      if (!fullPath) {
        logger.warn("Auto revalidation skipped because path field is empty", {
          uid,
          action,
          pathField,
        })

        return nextResult
      }

      await revalidateService.run({ uid, fullPaths: [fullPath], locale })
    } catch (error) {
      logError(error, "Auto revalidation failed", {
        uid,
        action,
        locale,
      })
    }

    return nextResult
  })
}

function shouldRevalidate(
  action: string | undefined,
  status: string | undefined,
  hasDraftAndPublish: boolean,
  policy: RevalidatePolicy | undefined
): boolean {
  if (!isWriteAction(action)) {
    return false
  }

  // When no explicit policy is set, derive from the content type's draftAndPublish setting:
  // - draftAndPublish enabled → "publish-only" (wait for publish/unpublish/delete)
  // - draftAndPublish disabled → "all-writes" (every save is immediately public)
  const resolvedPolicy =
    policy ?? (hasDraftAndPublish ? "publish-only" : "all-writes")

  if (resolvedPolicy === "all-writes") {
    return true
  }

  if (
    action !== undefined &&
    ["publish", "unpublish", "delete"].includes(action)
  ) {
    return true
  }

  // Some Strapi publish flows surface as update with published status.
  return action === "update" && status === "published"
}

function isWriteAction(action: string | undefined): boolean {
  return (
    action !== undefined &&
    ["create", "update", "delete", "publish", "unpublish"].includes(action)
  )
}

function getString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined
  }

  const trimmed = value.trim()

  return trimmed.length > 0 ? trimmed : undefined
}

function toRecord(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== "object") {
    return undefined
  }

  return value as Record<string, unknown>
}

/**
 * Strapi v5 publish/unpublish/delete actions return `{ entries: [...] }`
 * instead of a flat document. This extracts the first matching entry
 * (by locale if available) so field access works uniformly.
 */
function unwrapDocumentResult(
  result: unknown,
  localeParam: unknown
): Record<string, unknown> | undefined {
  const record = toRecord(result)

  if (!record) {
    return undefined
  }

  if (!Array.isArray(record.entries)) {
    return record
  }

  const locale = getString(localeParam)
  const entries = record.entries as Record<string, unknown>[]

  if (locale) {
    const localeMatch = entries.find((e) => getString(e.locale) === locale)

    if (localeMatch) {
      return localeMatch
    }
  }

  return toRecord(entries[0])
}
