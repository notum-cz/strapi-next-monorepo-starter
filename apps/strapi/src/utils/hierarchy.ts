import { errors } from "@strapi/utils"

import { ID } from "../../types"
import { LifecycleEventType } from "../../types/internals"

const { ValidationError } = errors

// Debugging
const LOGGER = false
const log = (...args: any[]) => {
  if (LOGGER) {
    console.log(...args)
  }
}

// List of document types that are part of the hierarchy.
// Currently only "api::page.page" is used.
type DocumentType = "api::page.page"

export async function handleHierarchyBeforeCreate(
  event: LifecycleEventType<"beforeCreate">,
  documentType: DocumentType
) {
  // Called when the entity is first time saved or every time when entity is published
  // First time we don't have `documentId` field in `newData`, also we don't have `where` field

  const newData = event.params.data
  if (!newData.documentId) {
    // Creation of draft entity -> nothing to do
    return
  }
  // Creation of published entity, we have `newData.publishedAt` field filled

  const { getOldPublishedDocument } = getFunctionsForDocumentType(documentType)

  // Parent doesn't exist if:
  //  - not connected
  //  - connected to DRAFT (never published page)
  const newParentId = newData.parent?.set?.[0]?.id
  const newSlug = newData.slug

  // Here we need use `connection` and `knex` to get the old published data
  // `strapi.documents` or `strapi.db.query` does not return the old published data here (strapi issue/future)
  const oldDataPublished = await getOldPublishedDocument(newData.documentId)

  log(`beforeCreate ${documentType}`, {
    newData,
    oldDataPublished,
    parentId: newParentId,
  })

  const wasSlugChanged = oldDataPublished && oldDataPublished.slug != newSlug
  const wasParentChanged =
    oldDataPublished && oldDataPublished.parent_id != newParentId

  if (wasSlugChanged || wasParentChanged || !newData.fullPath) {
    // There is either:
    //  - published entity and some change in slug or parent relation
    //  - new entity and no fullPath set

    await strapi
      .service("api::internal-job.internal-job")
      .enqueueJob("RECALCULATE_FULLPATH", newData.documentId, {
        documentType: "api::page.page",
        documentId: newData.documentId,
      })
  }
}

const getFunctionsForDocumentType = (documentType: DocumentType) => {
  switch (documentType) {
    case "api::page.page": {
      return {
        getOldPublishedDocument: (documentId: ID) =>
          strapi.db
            .connection("pages")
            .leftJoin(
              "pages_parent_lnk",
              "pages.id",
              "pages_parent_lnk.page_id"
            )
            .leftJoin(
              "pages as parent_pages",
              "pages_parent_lnk.inv_page_id",
              "parent_pages.id"
            )
            .select(["pages.*", "parent_pages.id as parent_id"])
            .where("pages.document_id", documentId)
            .whereNotNull("pages.published_at")
            .first(),
      }
    }
  }
}
