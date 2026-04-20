/**
 * internal-job service
 */

import { type Data, factories } from "@strapi/strapi"

import {
  type RecalculateFullPathResult,
  processCreateRedirectJob,
  processRecalculateFullPathJob,
} from "../../../utils/hierarchy"

type InternalJobType =
  Data.ContentType<"api::internal-job.internal-job">["jobType"]

type RunAllState = {
  pathsMap: Map<string, Set<string>>
  successfulJobs: string[]
  failedJobs: string[]
}

type JobHandler = {
  processJob: (
    job: Data.ContentType<"api::internal-job.internal-job">
  ) => Promise<unknown>
  handleJobResult: (result: unknown, state: RunAllState) => Promise<void>
  handleJobsCompletion: (state: RunAllState) => Promise<void>
}

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

    async runAll(jobType: InternalJobType) {
      const state = this.createRunAllState()
      const handlers = this.getJobHandlers()
      const handler = handlers[jobType]

      let job = await this.getNextJob(jobType)

      while (job != null) {
        try {
          const result = await handler.processJob(job)

          await handler.handleJobResult(result, state)

          await this.removeJob(job.documentId)

          state.successfulJobs.push(job.documentId)

          strapi.log.info(`Job ${jobType} (${job.id}) completed`)
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error)

          await this.updateJobStatus(job.documentId, "failed", errorMessage)
          state.failedJobs.push(job.documentId)

          strapi.log.error(`Job ${jobType} (${job.id}) failed: ${errorMessage}`)
        }

        job = await this.getNextJob(jobType)
      }

      await handler.handleJobsCompletion(state)

      return {
        successfulJobs: state.successfulJobs,
        failedJobs: state.failedJobs,
      }
    },

    createRunAllState(): RunAllState {
      return {
        pathsMap: new Map<string, Set<string>>(),
        successfulJobs: [],
        failedJobs: [],
      }
    },

    getJobHandlers(): Record<InternalJobType, JobHandler> {
      return {
        RECALCULATE_FULLPATH: {
          processJob: processRecalculateFullPathJob,
          handleJobResult: async (result: unknown, state: RunAllState) => {
            if (result == null) {
              return
            }

            const recalculateResult = result as RecalculateFullPathResult
            const mapKey = `${recalculateResult.documentType}::${recalculateResult.targetLocale}`
            const existingPaths =
              state.pathsMap.get(mapKey) ?? new Set<string>()

            for (const path of recalculateResult.touchedPaths) {
              existingPaths.add(path.trim())
            }

            state.pathsMap.set(mapKey, existingPaths)
          },
          handleJobsCompletion: async (state: RunAllState) => {
            for (const [mapKey, touchedPaths] of state.pathsMap) {
              if (touchedPaths.size === 0) {
                continue
              }

              const delimiterIndex = mapKey.lastIndexOf("::")
              const uid = mapKey.slice(0, delimiterIndex)
              const locale = mapKey.slice(delimiterIndex + 2)

              if (!uid || !locale) {
                continue
              }

              await strapi.service("api::revalidate.revalidate").run({
                uid,
                locale,
                fullPaths: [...touchedPaths],
              })
            }
          },
        },
        CREATE_REDIRECT: {
          processJob: processCreateRedirectJob,
          handleJobResult: async () => {},
          handleJobsCompletion: async () => {},
        },
      }
    },
  })
)
