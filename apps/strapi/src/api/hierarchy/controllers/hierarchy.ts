/**
 * hierarchy controller
 */

import { factories } from "@strapi/strapi"

import { logger } from "../../../utils/logging"
import { validateAdminToken } from "../../../utils/validate-admin-token"

export default factories.createCoreController(
  "api::hierarchy.hierarchy",
  ({ strapi }) => ({
    pendingChanges: async (ctx) => {
      const validation = await validateAdminToken(strapi, ctx.request.headers)
      if (validation.valid === false) {
        logger.warn(
          "Hierarchy pending changes rejected because admin token is invalid"
        )

        return ctx.forbidden(validation.error)
      }

      const changes = await strapi
        .service("api::hierarchy.hierarchy")
        .getPendingChanges()

      return { changes }
    },

    recalculate: async (ctx) => {
      const validation = await validateAdminToken(strapi, ctx.request.headers)
      if (validation.valid === false) {
        logger.warn(
          "Hierarchy recalculation rejected because admin token is invalid"
        )

        return ctx.forbidden(validation.error)
      }

      const result = await strapi
        .service("api::hierarchy.hierarchy")
        .applyPendingChanges()

      return result
    },
  })
)
