/**
 * internal-job controller
 */

import { factories } from "@strapi/strapi"
import jwt from "jsonwebtoken"

const validateAdminToken = (strapi, headers) => {
  const authHeader = headers["authorization"]
  const token = authHeader?.split(" ")[1]
  if (!token) {
    return { valid: false, error: "No token provided" }
  }

  const decoded: any = jwt.verify(token, strapi.config.get("admin.auth.secret"))
  if (!decoded?.userId) {
    return { valid: false, error: "Invalid token" }
  }

  return { valid: true, userId: decoded.userId }
}

export default factories.createCoreController(
  "api::internal-job.internal-job",
  ({ strapi }) => ({
    runRecalculateFullpathAll: async (ctx) => {
      const headers = ctx.request.headers

      const { valid, error } = validateAdminToken(strapi, headers)
      if (!valid) {
        return ctx.forbidden(error)
      }

      const result = await strapi
        .service("api::internal-job.internal-job")
        .runAll("RECALCULATE_FULLPATH")

      return result
    },

    runCreateRedirectsAll: async (ctx) => {
      const headers = ctx.request.headers

      const { valid, error } = validateAdminToken(strapi, headers)
      if (!valid) {
        return ctx.forbidden(error)
      }

      const result = await strapi
        .service("api::internal-job.internal-job")
        .runAll("CREATE_REDIRECT")

      return result
    },
  })
)
