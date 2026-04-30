/**
 * internal-job controller
 */

import { factories } from "@strapi/strapi"

import { validateAdminToken } from "../../../utils/validate-admin-token"

export default factories.createCoreController(
  "api::internal-job.internal-job",
  ({ strapi }) => ({
    runRecalculateFullpathAll: async (ctx) => {
      const headers = ctx.request.headers

      const validation = validateAdminToken(strapi, headers)
      if (validation.valid === false) {
        return ctx.forbidden(validation.error)
      }

      const result = await strapi
        .service("api::internal-job.internal-job")
        .runAll("RECALCULATE_FULLPATH")

      return result
    },

    runCreateRedirectsAll: async (ctx) => {
      const headers = ctx.request.headers

      const validation = validateAdminToken(strapi, headers)
      if (validation.valid === false) {
        return ctx.forbidden(validation.error)
      }

      const result = await strapi
        .service("api::internal-job.internal-job")
        .runAll("CREATE_REDIRECT")

      return result
    },
  })
)
