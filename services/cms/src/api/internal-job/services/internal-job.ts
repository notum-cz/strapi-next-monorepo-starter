/**
 * internal-job service
 */

import { Data, factories } from "@strapi/strapi"

import { hierarchyService } from "./hierarchyService"

export default factories.createCoreService(
  "api::internal-job.internal-job",
  ({ strapi }) => ({
    async enqueueJob(
      jobType: Data.ContentType<"api::internal-job.internal-job">["jobType"],
      relatedDocumentId: Data.ContentType<"api::internal-job.internal-job">["relatedDocumentId"],
      payload: Data.ContentType<"api::internal-job.internal-job">["payload"]
    ) {
      if (!payload) {
        throw new Error("Payload is required for job creation")
      }

      const samePendingJob = await strapi
        .documents("api::internal-job.internal-job")
        .findFirst({
          filters: { jobType, relatedDocumentId, state: "pending" },
        })

      if (samePendingJob) {
        return samePendingJob
      }

      return strapi.documents("api::internal-job.internal-job").create({
        data: {
          jobType,
          relatedDocumentId,
          payload: JSON.stringify(payload),
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

    async runAll(
      jobType: Data.ContentType<"api::internal-job.internal-job">["jobType"]
    ) {
      let job = await this.getNextJob(jobType)
      const successfulJobs: string[] = []
      const failedJobs: string[] = []

      while (job != null) {
        try {
          await hierarchyService[jobType](job.payload as any)
          await this.updateJobStatus(job.documentId, "completed")
          successfulJobs.push(job.documentId)

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

      return {
        successfulJobs,
        failedJobs,
      }
    },
  })
)
