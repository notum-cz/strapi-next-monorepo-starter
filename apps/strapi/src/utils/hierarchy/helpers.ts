import { Data } from "@strapi/strapi"
import { ROOT_PAGE_PATH } from "@repo/shared-data"

import { ID } from "../../../types"
import { HierarchicalDocumentType } from "./types"

/**
 * Calculates the fullPath of a hierarchical document based on its parent's fullPath and its own slug.
 */
export const calculateDocumentFullPath = (
  page: Data.ContentType<HierarchicalDocumentType>
) => {
  if (page.parent?.fullPath) {
    return joinPaths(page.parent.fullPath, page.slug)
  }

  return page.slug
}

const joinPaths = (...paths: Array<string | undefined | null>) => {
  const joinedPath = paths
    .flatMap((path) => path.split("/"))
    .filter(Boolean)
    .join("/")

  return joinedPath
}

/**
 * Retrieves the old (currently) published version of document by its documentId.
 */
export const getOldPublishedDocument = (
  documentType: HierarchicalDocumentType,
  documentId: ID
) => {
  switch (documentType) {
    case "api::page.page": {
      return (
        strapi.db
          // Here we need use `connection` and `knex` to get the old published data
          // `strapi.documents` or `strapi.db.query` does not return the old published data here (strapi issue/future)
          .connection("pages")
          .leftJoin("pages_parent_lnk", "pages.id", "pages_parent_lnk.page_id")
          .leftJoin(
            "pages as parent_pages",
            "pages_parent_lnk.inv_page_id",
            "parent_pages.id"
          )
          .select(["pages.*", "parent_pages.id as parent_id"])
          .where("pages.document_id", documentId)
          .whereNotNull("pages.published_at")
          .first()
      )
    }
  }
}

/**
 * Normalizes the redirect paths by ensuring they have the correct format.
 */
export const normalizeRedirectPaths = (
  oldPath: string,
  newPath: string,
  targetLocale: string | undefined
) => {
  // remove `ROOT_PAGE_PATH` prefix (if exists)
  let source = oldPath.replace(new RegExp(`^${ROOT_PAGE_PATH}`), "")
  let destination = newPath.replace(new RegExp(`^${ROOT_PAGE_PATH}`), "")

  // ensure starting slashes
  source = !source.startsWith("/") ? `/${source}` : source
  destination = !destination.startsWith("/") ? `/${destination}` : destination

  // add locale prefix (if exists) for both oldPath and newPath if they don't have it
  // oldPath will have it if there was previous redirect created with locale prefix (by this same logic)
  if (targetLocale) {
    source = !source.startsWith(`/${targetLocale}`)
      ? `/${targetLocale}${source}`
      : source
    destination = !destination.startsWith(`/${targetLocale}`)
      ? `/${targetLocale}${destination}`
      : destination
  }

  return { oldPath: source, newPath: destination }
}
