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
 * Strapi Documents API middleware that enables dynamic population of components inside dynamic zones via the `populateDynamicZone` request parameter.
 *
 * When `populateDynamicZone` is present, the middleware:
 * - validates that requested attributes exist on the content type
 * - prefetches data to detect which components are actually used
 * - automatically builds an optimal `populate` configuration for those components
 *
 * This allows clients to request fully populated dynamic zone content without manually defining deep populate trees, while significantly improving performance.
 */

export const registerPopulatePageMiddleware = ({ strapi }) => {
  strapi.documents.use(async (context, next) => {
    if (!pageActions.has(context.action)) {
      return next()
    }

    const isDynamicZonePopulateEnabled =
      normalizeDynamicZonePopulate(context.params?.populateDynamicZone).length >
      0

    if (!isDynamicZonePopulateEnabled) {
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
