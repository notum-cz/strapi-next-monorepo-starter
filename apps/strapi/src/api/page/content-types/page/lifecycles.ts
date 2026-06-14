import { ROOT_PAGE_PATH } from "@repo/shared-data"
import type { Modules } from "@strapi/strapi"
import { errors } from "@strapi/utils"

import type { LifecycleEventType } from "../../../../../types/internals"

const { ValidationError } = errors

type WriteEvent =
  | LifecycleEventType<"beforeCreate">
  | LifecycleEventType<"beforeUpdate">

/**
 * Resolves the documentId of the page being written.
 *
 * On create the document service puts `documentId` in `data`. On update it
 * identifies the draft row by its numeric `id` in `where` instead, so the
 * documentId has to be looked up from that row.
 */
async function resolvePageDocumentId(
  event: WriteEvent
): Promise<Modules.Documents.ID | undefined> {
  const { data, where } = event.params

  const documentId = data?.documentId ?? where?.documentId
  if (documentId) {
    return documentId
  }

  const id = where?.id
  if (typeof id !== "number" && typeof id !== "string") {
    return undefined
  }

  const row = await strapi.db
    .connection("pages")
    .select("document_id")
    .where("id", id)
    .first()

  return row?.document_id
}

/**
 * Retrieves the currently published version of a page by its documentId.
 *
 * `strapi.documents` / `strapi.db.query` don't return the previously published
 * row during a write, so the published data is read directly via the query
 * builder.
 */
function getOldPublishedPage(documentId: Modules.Documents.ID) {
  return strapi.db
    .connection("pages")
    .select("pages.*")
    .where("pages.document_id", documentId)
    .whereNotNull("pages.published_at")
    .first()
}

/**
 * Prevents changing the slug of the published root page (`/`).
 *
 * Runs on every write (draft save and publish alike), so the reserved root
 * slug can't be changed by saving a draft either — not only when publishing.
 * FullPath recalculation is not triggered here: pending changes are computed
 * on demand by the `api::hierarchy.hierarchy` service.
 */
async function preventRootSlugChange(event: WriteEvent) {
  const newData = event.params.data
  if (!newData) {
    return
  }

  // Automated/system changes (e.g. hierarchy recalculation) set `updatedBy`
  // to `null` explicitly -> skip. Regular writes that simply omit `updatedBy`
  // (undefined) must still be guarded, so compare strictly against null.
  if (newData.updatedBy === null) {
    return
  }

  // Writes that don't touch the slug can't change it.
  if (newData.slug === undefined) {
    return
  }

  const documentId = await resolvePageDocumentId(event)
  if (!documentId) {
    // Brand-new entity with no published version yet -> nothing to protect.
    return
  }

  const oldPublished = await getOldPublishedPage(documentId)

  if (
    oldPublished &&
    oldPublished.slug === ROOT_PAGE_PATH &&
    newData.slug !== ROOT_PAGE_PATH
  ) {
    throw new ValidationError(
      `The slug '${ROOT_PAGE_PATH}' is reserved for the root page and cannot be changed.`
    )
  }
}

export default {
  async beforeCreate(event: LifecycleEventType<"beforeCreate">) {
    await preventRootSlugChange(event)
  },
  async beforeUpdate(event: LifecycleEventType<"beforeUpdate">) {
    await preventRootSlugChange(event)
  },
}
