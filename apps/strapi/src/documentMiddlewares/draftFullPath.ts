import { normalizePageFullPath } from "@repo/shared-data"
import type { Core, UID } from "@strapi/strapi"

const PAGE_UID = "api::page.page" satisfies UID.CollectionType

/**
 * Document Service middleware that stamps `fullPath` on never-published
 * pages, so Preview (and the draft-mode UI lookup by `fullPath`) works before
 * the first publish.
 *
 * Pages that already have a published version are skipped — their path
 * changes must go through Update hierarchy, which also creates redirects.
 */
export const registerDraftFullPath = ({ strapi }: { strapi: Core.Strapi }) => {
  strapi.documents.use(async (context, next) => {
    const result = await next()

    if (
      context.uid === PAGE_UID &&
      (context.action === "create" || context.action === "update")
    ) {
      await stampDraftFullPath(strapi, context.uid, result)
    }

    return result
  })
}

async function stampDraftFullPath(
  strapi: Core.Strapi,
  uid: typeof PAGE_UID,
  result: unknown
): Promise<void> {
  const doc = result as
    | null
    | undefined
    | { documentId?: string; locale?: string; fullPath?: string }
  if (!doc?.documentId) {
    return
  }
  const { documentId, locale } = doc

  const published = await strapi
    .documents(uid)
    .findOne({ documentId, locale, status: "published" })
  if (published) {
    return
  }

  const draft = (await strapi.documents(uid).findOne({
    documentId,
    locale,
    status: "draft",
    populate: { parent: { fields: ["fullPath"] } },
  })) as null | {
    slug?: string
    fullPath?: string
    parent?: null | { fullPath?: string }
  }
  if (!draft?.slug) {
    return
  }

  // Same rule as computeFullPathChanges in the hierarchy API utils
  const fullPath = normalizePageFullPath([draft.parent?.fullPath, draft.slug])
  if (fullPath === draft.fullPath) {
    return
  }

  // Direct DB write: skips lifecycles and the revalidate middleware
  await strapi.db
    .connection("pages")
    .where({ document_id: documentId, locale })
    .whereNull("published_at")
    .update({ full_path: fullPath })

  doc.fullPath = fullPath
}
