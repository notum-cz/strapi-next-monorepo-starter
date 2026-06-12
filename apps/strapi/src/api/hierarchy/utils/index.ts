import { normalizePageFullPath, ROOT_PAGE_PATH } from "@repo/shared-data"
import type { Modules } from "@strapi/strapi"
import { errors } from "@strapi/utils"

import type {
  FullPathChange,
  HierarchicalDocumentType,
  HierarchyPageNode,
} from "./types"
import type { LifecycleEventType } from "../../../../types/internals"
import { PAGES_HIERARCHY_ENABLED } from "../../../utils/constants"

const { ValidationError } = errors

/**
 * Lifecycle handler for `beforeCreate` event of hierarchical document types.
 *
 * Validates that the root page slug (`/`) is never changed. FullPath
 * recalculation itself is no longer triggered from lifecycles — pending
 * changes are computed on demand by the `api::hierarchy.hierarchy` service.
 */
export async function handleHierarchyBeforeCreate(
  event: LifecycleEventType<"beforeCreate">,
  documentType: HierarchicalDocumentType
) {
  if (!PAGES_HIERARCHY_ENABLED) {
    return
  }

  // Called when the entity is first saved and every time it is published.
  // On the first save there is no `documentId` field in `newData`.
  const newData = event.params.data
  if (!newData.documentId) {
    // Creation of draft entity -> nothing to validate
    return
  }

  if (newData.updatedBy == null) {
    // Automated/system change (e.g. hierarchy recalculation), skip
    return
  }

  const oldDataPublished = await getOldPublishedDocument(
    documentType,
    newData.documentId
  )

  if (
    oldDataPublished &&
    oldDataPublished.slug === ROOT_PAGE_PATH &&
    newData.slug !== ROOT_PAGE_PATH
  ) {
    // Prevent changing the slug of the homepage/root page
    throw new ValidationError(
      `The slug '${ROOT_PAGE_PATH}' is reserved for the root page and cannot be changed.`
    )
  }
}

/**
 * Retrieves the old (currently) published version of document by its documentId.
 */
export const getOldPublishedDocument = (
  documentType: HierarchicalDocumentType,
  documentId: Modules.Documents.ID
) => {
  // eslint-disable-next-line sonarjs/no-small-switch
  switch (documentType) {
    case "api::page.page":
      return (
        strapi.db
          // Here we need use `connection` and `knex` to get the old published data
          // `strapi.documents` or `strapi.db.query` does not return the old published data here (strapi issue/future)
          .connection("pages")
          .select("pages.*")
          .where("pages.document_id", documentId)
          .whereNotNull("pages.published_at")
          .first()
      )
  }
}

/**
 * Computes which pages need a new fullPath by comparing the stored fullPath
 * with the one derived from the parent chain (parent fullPath + own slug).
 *
 * Pure function over one locale's published pages. Pages whose stored
 * fullPath already matches produce no change; pages without a previous
 * fullPath (newly published) produce a change without a redirect.
 */
export function computeFullPathChanges(
  pages: HierarchyPageNode[]
): FullPathChange[] {
  const pagesById = new Map(pages.map((page) => [page.documentId, page]))
  const expectedFullPaths = new Map<string, string>()

  const getExpectedFullPath = (
    page: HierarchyPageNode,
    visited: Set<string>
  ): string => {
    const cached = expectedFullPaths.get(page.documentId)
    if (cached != null) {
      return cached
    }

    const parent = page.parentDocumentId
      ? pagesById.get(page.parentDocumentId)
      : undefined

    let fullPath: string
    if (parent && !visited.has(parent.documentId)) {
      visited.add(parent.documentId)
      fullPath = normalizePageFullPath([
        getExpectedFullPath(parent, visited),
        page.slug,
      ])
    } else {
      // No parent (root page or orphan), parent not published, or a parent
      // cycle — fall back to the page's own slug, matching the previous
      // behavior when the `parent` relation did not populate.
      fullPath = normalizePageFullPath([page.slug])
    }

    expectedFullPaths.set(page.documentId, fullPath)

    return fullPath
  }

  const changes: FullPathChange[] = []

  for (const page of pages) {
    const newFullPath = getExpectedFullPath(page, new Set([page.documentId]))

    if (newFullPath === page.fullPath) {
      continue
    }

    let redirect: FullPathChange["redirect"] = null
    if (page.fullPath) {
      const source = normalizePageFullPath([page.fullPath], page.locale)
      const destination = normalizePageFullPath([newFullPath], page.locale)

      // A redirect pointing to itself (e.g. the stored fullPath only differed
      // in normalization) would be useless, so skip it.
      redirect = source === destination ? null : { source, destination }
    }

    changes.push({
      documentId: page.documentId,
      locale: page.locale,
      slug: page.slug,
      oldFullPath: page.fullPath ?? null,
      newFullPath,
      redirect,
    })
  }

  return changes
}
