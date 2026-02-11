import { errors } from "@strapi/utils"

import {
  extractComponentsToPopulate,
  getComponentsConfigForDynamicZones,
  normalizeDynamicZonePopulate,
  prefetchDataToPopulate,
} from "./helpers"

// We're using findMany to find the pages, but this could be adjusted to findOne per your needs
const pageActions = new Set(["findMany", "findOne", "findFirst"])

/**
 * Registers a middleware to customize the population of related fields for page documents during Strapi queries.
 *
 * This middleware intercepts document queries for the "api::page.page" content type when the action is "findMany".
 * If the request parameters include pagination with { start: 0, limit: 1 } and a 'middlewarePopulate' array,
 * it selectively applies deep population rules for specified attributes, as defined in 'pagePopulateObject'.
 *
 * The request must contain 'middlewarePopulate' (array of string keys) in the 'params' object, which is going to be mapped to 'pagePopulateObject' attributes.
 *
 */

export const registerPopulatePageMiddleware = ({ strapi }) => {
  strapi.documents.use(async (context, next) => {
    if (!pageActions.has(context.action)) {
      return next()
    }

    const isSmartPopulateEnabled =
      normalizeDynamicZonePopulate(context.params.populateDynamicZone).length >
      0

    if (!isSmartPopulateEnabled) {
      return next()
    }

    const dynamicZonePopulate = normalizeDynamicZonePopulate(
      context.params.populateDynamicZone
    )

    const attributesNotExists = dynamicZonePopulate.filter(
      (populateAttr) =>
        context.contentType.attributes[populateAttr] === undefined
    )

    if (attributesNotExists.length > 0) {
      throw new errors.ValidationError(
        `Attributes '${attributesNotExists.join(", ")}' do not exist`
      )
    }

    delete context.params.populateDynamicZone

    const prefetchedDataToPopulate = await prefetchDataToPopulate(
      dynamicZonePopulate,
      context
    )

    const componentsToPopulate = extractComponentsToPopulate(
      prefetchedDataToPopulate,
      dynamicZonePopulate
    )

    const dynamicZonesPopulateObject =
      getComponentsConfigForDynamicZones(componentsToPopulate)

    context.params.populate = {
      ...context.params.populate,
      ...dynamicZonesPopulateObject,
    }

    return next()
  })
}
