/**
 * internal-job service
 */

import { type Data, factories } from "@strapi/strapi"

import {
  processCreateRedirectJob,
  processRecalculateFullPathJob,
} from "../../../utils/hierarchy"

export default factories.createCoreService(
  "api::internal-job.internal-job",
  ({ strapi }) => ({
    async enqueueJob(
      jobType: Data.ContentType<"api::internal-job.internal-job">["jobType"],
      requiredData: {
        documentType: string // used to find the right collection
        relatedDocumentId: string // the documentId of the related document
        targetLocale: string // locale of the target document
        slug?: string // optional, used for better displaying in the admin panel
      },
      optionalPayload?: Data.ContentType<"api::internal-job.internal-job">["payload"]
    ) {
      if (
        !requiredData ||
        !requiredData.documentType ||
        !requiredData.relatedDocumentId ||
        !requiredData.targetLocale
      ) {
        throw new Error("Missing required data to enqueue job")
      }

      const { relatedDocumentId, targetLocale, documentType, slug } =
        requiredData

      const samePendingJob = await strapi
        .documents("api::internal-job.internal-job")
        .findFirst({
          filters: {
            jobType,
            relatedDocumentId,
            targetLocale,
            state: "pending",
          },
        })

      if (samePendingJob) {
        // remove the same pending job
        await strapi.documents("api::internal-job.internal-job").delete({
          documentId: samePendingJob.documentId,
        })
      }

      return strapi.documents("api::internal-job.internal-job").create({
        data: {
          jobType,
          relatedDocumentId,
          documentType,
          targetLocale,
          slug,
          payload: optionalPayload ? JSON.stringify(optionalPayload) : null,
          state: "pending",
        },
      })
    },

    async getNextJob(
      jobType: Data.ContentType<"api::internal-job.internal-job">["jobType"]
    ) {
      return strapi.documents("api::internal-job.internal-job").findFirst({
        filters: { jobType, state: "pending" },
        orderBy: { createdAt: "asc" },
      })
    },

    async updateJobStatus(
      documentId: string,
      state: Data.ContentType<"api::internal-job.internal-job">["state"],
      error: string | null = null
    ) {
      return strapi.documents("api::internal-job.internal-job").update({
        documentId,
        data: { state, error },
      })
    },

    async removeJob(documentId: string) {
      return strapi.documents("api::internal-job.internal-job").delete({
        documentId,
      })
    },

    async runAll(
      jobType: Data.ContentType<"api::internal-job.internal-job">["jobType"]
    ) {
      const handlers = this.getJobHandlers()
      const successfulJobs: string[] = []
      const failedJobs: string[] = []

      // Aggregate touched paths so the frontend cache is revalidated once per
      // batch. Hierarchy jobs write `updatedBy: null`, which the auto-revalidate
      // document middleware skips, so we revalidate here instead.
      const fullPathsByLocale = new Map<string, Set<string>>()
      const redirectSources = new Set<string>()

      let job = await this.getNextJob(jobType)

      while (job != null) {
        try {
          const result = await handlers[jobType](job)
          await this.removeJob(job.documentId)

          successfulJobs.push(job.documentId)

          if (result && typeof result === "object") {
            const fullPath = (result as { fullPath?: unknown }).fullPath
            const locale = (result as { locale?: unknown }).locale
            const source = (result as { source?: unknown }).source

            if (typeof fullPath === "string" && typeof locale === "string") {
              const set = fullPathsByLocale.get(locale) ?? new Set<string>()
              set.add(fullPath)
              fullPathsByLocale.set(locale, set)
            }

            if (typeof source === "string") {
              redirectSources.add(source)
            }
          }

          strapi.log.info(`Job ${jobType} (${job.id}) completed`)
        } catch (error) {
          await this.updateJobStatus(job.documentId, "failed", error.message)
          failedJobs.push(job.documentId)

          strapi.log.error(
            `Job ${jobType} (${job.id}) failed: ${error.message}`
          )
        }

        job = await this.getNextJob(jobType)
      }

      const revalidateService = strapi.service("api::revalidate.revalidate")

      try {
        for (const [locale, paths] of fullPathsByLocale) {
          await revalidateService.run({
            uid: "api::page.page",
            locale,
            fullPaths: [...paths],
          })
        }

        // Redirect sources are already locale-prefixed by
        // processCreateRedirectJob, so no `locale` is passed here.
        if (redirectSources.size > 0) {
          await revalidateService.run({
            uid: "api::redirect.redirect",
            fullPaths: [...redirectSources],
          })
        }
      } catch (error) {
        strapi.log.error(
          `Revalidation after ${jobType} batch failed: ${(error as Error).message}`
        )
      }

      return {
        successfulJobs,
        failedJobs,
      }
    },

    getJobHandlers(): Record<
      Data.ContentType<"api::internal-job.internal-job">["jobType"],
      Function
    > {
      return {
        RECALCULATE_FULLPATH: processRecalculateFullPathJob,
        CREATE_REDIRECT: processCreateRedirectJob,
      }
    },
  })
)
