import { ID } from "../../../types"
import { HierarchicalDocumentType } from "./types"

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
