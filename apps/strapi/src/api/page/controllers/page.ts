/**
 * page controller
 */

import { factories } from "@strapi/strapi"

import {
  generateBreadcrumbs,
  getFullPathFromQuery,
} from "../../../utils/breadcrumbs"

export default factories.createCoreController(
  "api::page.page",
  ({ strapi }) => ({
    async find(ctx) {
      const { data, meta } = await super.find(ctx)

      const fullPath = getFullPathFromQuery(ctx)

      if (fullPath && data && data.length === 1) {
        // Create breadcrumbs only when a specific page is requested to avoid unnecessary processing

        meta.breadcrumbs = await generateBreadcrumbs(data[0], "api::page.page")
      }

      return { data, meta }
    },
  })
)
