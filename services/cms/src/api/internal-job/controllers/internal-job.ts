/**
 * internal-job controller
 */

import { factories } from "@strapi/strapi"

export default factories.createCoreController(
  "api::internal-job.internal-job",
  ({ strapi }) => ({
    runRecalculateFullpathAll: async (ctx) => {
      // TODO: Add permission check

      const result = await strapi
        .service("api::internal-job.internal-job")
        .runAll("RECALCULATE_FULLPATH")

      return result
    },

    runCreateRedirectsAll: async (ctx) => {
      // TODO: Add permission check

      const result = await strapi
        .service("api::internal-job.internal-job")
        .runAll("CREATE_REDIRECT")

      return result
    },
  })
)
