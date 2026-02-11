import { errors } from "@strapi/utils"

import { getPopulateDynamicZoneConfig } from "../populateDynamicZone"

// Normalize the input to always have an array of strings representing the dynamic zones
export const normalizeDynamicZonePopulate = (
  populateDynamicZone: string[] | string | undefined
) => {
  if (!populateDynamicZone) {
    return []
  }
  if (typeof populateDynamicZone === "string") {
    return [populateDynamicZone]
  }
  if (
    typeof populateDynamicZone === "object" &&
    !Array.isArray(populateDynamicZone)
  ) {
    return Object.keys(populateDynamicZone).map((key) => key)
  }
  return populateDynamicZone
}

// Get general populate config for dynamic zones based on the filesystem structure and check if it exists.
export const getPopulateConfig = () => {
  const populateConfig = getPopulateDynamicZoneConfig()
  if (!populateConfig) {
    throw new errors.ValidationError(
      `Populate config not found, please add it to the 'POPULATE_CONFIG' object in the 'populateDynamicZone' file`
    )
  }
  return populateConfig
}

// Extract the unique components that need to be populated for each dynamic zone
export const extractComponentsToPopulate = (
  data: unknown,
  attributes: string[]
): Record<string, string[]> => {
  const entries = Array.isArray(data) ? data : [data]
  const result = {}

  for (const attr of attributes) {
    const components = new Set()

    for (const entry of entries) {
      const zone = entry?.[attr]
      if (!Array.isArray(zone)) continue

      for (const block of zone) {
        if (block?.__component) {
          components.add(block.__component)
        }
      }
    }

    result[attr] = [...components]
  }

  return result
}

/**
 * Build the final populate object for Strapi based on the components that need to be populated for each dynamic zone and the general config for those components. The resulting object will have the format:
 * @returns
 * {
 *   "dynamicZoneName": {
 *     on: {
 *.      "component.uid": { ...populateConfigForThatComponent }
 *     }
 *  }
 *   "secondDynamicZoneName": {
 *     on: {
 *       "component.uid": { ...populateConfigForThatComponent }
 *     }
 *   }
 * }
 */
export const getComponentsConfigForDynamicZones = (
  componentsToPopulate
): Record<string, { on: Record<string, unknown> }> => {
  const populateConfig = getPopulateConfig()

  return Object.fromEntries(
    Object.entries(componentsToPopulate).map(
      ([zone, components]: [string, string[]]) => [
        zone,
        {
          on: Object.fromEntries(
            components
              .filter((c) => c in populateConfig)
              .map((c) => [c, populateConfig[c]])
          ),
        },
      ]
    )
  )
}

// Prefetch the dynamic zone components, to know what component objects we need to populate in the next step.
export const prefetchDataToPopulate = async (dynamicZonePopulate, context) => {
  const attributesToPrefetch = dynamicZonePopulate.reduce((acc, attr) => {
    return {
      ...acc,
      [attr]: true,
    }
  }, {})

  return await strapi.documents(context.uid)[context.action].call(this, {
    documentId: context.documentId,
    populate: attributesToPrefetch,
    fields: ["documentId"],
    locale: context.locale,
  })
}
