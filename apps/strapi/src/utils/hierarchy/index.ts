import { Data } from "@strapi/strapi"
import { errors } from "@strapi/utils"
import { normalizePageFullPath, ROOT_PAGE_PATH } from "@repo/shared-data"

import { LifecycleEventType } from "../../../types/internals"
import { PAGES_HIERARCHY_ENABLED } from "../constants"
import { getOldPublishedDocument } from "./helpers"
import { CreateRedirectPayload, HierarchicalDocumentType } from "./types"

const { ValidationError } = errors

/**
 * Lifecycle handler for `beforeCreate` event of hierarchical document types.
 *
 * This should be called in the `beforeCreate` lifecycle event of content types
 * that are part of the hierarchy.
 */
export async function handleHierarchyBeforeCreate(
  event: LifecycleEventType<"beforeCreate">,
  documentType: HierarchicalDocumentType
) {
  if (!PAGES_HIERARCHY_ENABLED) {
    return
  }

  // Called when the entity is first time saved or every time when entity is published
  // First time we don't have `documentId` field in `newData`, also we don't have `where` field

  const newData = event.params.data
  if (!newData.documentId) {
    // Creation of draft entity -> nothing to do
    return
  }

  if (newData.updatedBy == null) {
    // Automated/system change, skip hierarchy handling
    return
  }

  // Creation of published entity, we have `newData.publishedAt` field filled

  // Parent doesn't exist if:
  //  - not connected
  //  - connected to DRAFT (never published page)
  const newParentId = newData.parent?.set?.[0]?.id
  const newSlug = newData.slug

  const oldDataPublished = await getOldPublishedDocument(
    documentType,
    newData.documentId
  )

  const wasSlugChanged = oldDataPublished && oldDataPublished.slug != newSlug
  const wasParentChanged =
    oldDataPublished && oldDataPublished.parent_id != newParentId

  if (wasSlugChanged || wasParentChanged || !newData.fullPath) {
    // There is either:
    //  - published entity and some change in slug or parent relation
    //  - new entity and no fullPath set

    if (wasSlugChanged && oldDataPublished?.slug === ROOT_PAGE_PATH) {
      // Prevent changing the slug of the homepage/root page
      throw new ValidationError(
        `The slug '${ROOT_PAGE_PATH}' is reserved for the root page and cannot be changed.`
      )
    }

    await strapi
      .service("api::internal-job.internal-job")
      .enqueueJob("RECALCULATE_FULLPATH", {
        documentType,
        relatedDocumentId: newData.documentId,
        targetLocale: newData.locale,
        slug: newSlug,
      })
  }
}

/**
 * Handler for processing RECALCULATE_FULLPATH internal jobs. It recalculates
 * the fullPath of the document, updates it if necessary, do the same for its children,
 * and creates redirect jobs if the fullPath has changed.
 */
export const processRecalculateFullPathJob = async (
  job: Data.ContentType<"api::internal-job.internal-job">
) => {
  const { relatedDocumentId, documentType, targetLocale, jobType } = job

  if (jobType !== "RECALCULATE_FULLPATH") {
    return
  }

  const document = await strapi
    .documents(documentType as HierarchicalDocumentType)
    .findOne({
      documentId: relatedDocumentId,
      locale: targetLocale,
      populate: {
        parent: true,
        children: true,
      },
    })

  if (!document) {
    return
  }

  let oldFullPath = document.fullPath
  const newFullPath = normalizePageFullPath([
    document.parent?.fullPath,
    document.slug,
  ])

  if (newFullPath !== oldFullPath) {
    // Always update fullPath of document to newFullPath
    await strapi.documents(documentType as HierarchicalDocumentType).update({
      documentId: document.documentId,
      data: {
        fullPath: newFullPath,
        // we set updatedBy to null to indicate that this was an automated/system change
        // so that we don't trigger repeated `handleHierarchyBeforeCreate` calls
        updatedBy: null,
      },
      locale: targetLocale,
      status: "published",
    })

    // Create RECALCULATE_FULLPATH jobs for all children
    const children = (document as any).children ?? []
    for (const child of children) {
      await strapi
        .service("api::internal-job.internal-job")
        .enqueueJob("RECALCULATE_FULLPATH", {
          documentType,
          relatedDocumentId: child.documentId,
          targetLocale: child.locale,
          slug: child.slug,
        })
    }
  }

  // Creating redirect

  // if there is a pending internal job for CREATE_REDIRECT for this document,
  // we have to compare newPath with original oldPath because it might be different
  // from the current one
  // (when user does 2x RECALCULATE_FULLPATH without creating a redirect)

  const existingRedirectJob = await strapi
    .documents("api::internal-job.internal-job")
    .findFirst({
      filters: {
        jobType: "CREATE_REDIRECT",
        relatedDocumentId: document.documentId,
        targetLocale: document.locale,
        state: "pending",
      },
    })

  const existingRedirectJobPayload =
    existingRedirectJob?.payload as CreateRedirectPayload | null

  oldFullPath = existingRedirectJobPayload?.oldPath ?? oldFullPath

  if (oldFullPath && oldFullPath !== newFullPath) {
    // there was a change in fullPath -> create new redirect job

    if (existingRedirectJob) {
      await strapi.documents("api::internal-job.internal-job").delete({
        documentId: existingRedirectJob.documentId,
      })
    }

    const payload: CreateRedirectPayload = {
      oldPath: normalizePageFullPath([oldFullPath], document.locale),
      newPath: normalizePageFullPath([newFullPath], document.locale),
    }

    await strapi.service("api::internal-job.internal-job").enqueueJob(
      "CREATE_REDIRECT",
      {
        documentType,
        relatedDocumentId: document.documentId,
        targetLocale: document.locale,
        slug: document.slug,
      },
      payload
    )
  } else if (existingRedirectJob) {
    // if fullPath didn't change or was reverted to original value,
    // we can remove the existing redirect job
    await strapi.documents("api::internal-job.internal-job").delete({
      documentId: existingRedirectJob.documentId,
    })
  }
}

/**
 * Handler for processing CREATE_REDIRECT internal jobs. Based on the job payload,
 * it creates a redirect from the old path to the new path and publishes it.
 */
export const processCreateRedirectJob = async (
  job: Data.ContentType<"api::internal-job.internal-job">
) => {
  if (job.jobType !== "CREATE_REDIRECT") {
    return
  }

  const payload = job.payload as CreateRedirectPayload | null

  if (!payload) {
    return
  }

  await strapi.documents("api::redirect.redirect").create({
    data: {
      source: payload.oldPath,
      destination: payload.newPath,
      permanent: true,
    },
    status: "published",
  })
}
