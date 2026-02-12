import { UID } from "@strapi/strapi"
import { errors } from "@strapi/utils"

import { getPopulateDynamicZoneConfig } from "../populateDynamicZone"

/**
 * Normalize the input to always have an array of strings
 * representing the dynamic zones
 */
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

/**
 * Get general populate config for dynamic zones based on the
 * filesystem structure and check if it exists.
 */
export const getPopulateConfig = () => {
  const populateConfig = getPopulateDynamicZoneConfig()
  if (!populateConfig) {
    throw new errors.ValidationError(
      `Populate config not found. Ensure the filesystem-based dynamic zone populate configuration exists in the expected structure and that it is correctly exported.`
    )
  }

  return populateConfig
}

/**
 * Build the final populate object for Strapi based on the components that need to be populated
 * for each dynamic zone and the general config for those components. The resulting object will have the format:
 *
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
export const createComponentsPopulateObject = (
  componentsToPopulate: Record<string, string[]>
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

/**
 * Prefetch dynamic zone data and extract the unique components
 * that need to be populated for each dynamic zone.
 */
export const getComponentsToPopulate = async (
  dynamicZonePopulate: string[],
  context: {
    uid: UID.ContentType
    action: string
    documentId: string | number
    locale?: string
  }
): Promise<Record<string, string[]>> => {
  const attributesToPrefetch = dynamicZonePopulate.reduce((acc, attr) => {
    return {
      ...acc,
      [attr]: true,
    }
  }, {})

  const prefetchedData = await strapi
    .documents(context.uid)
    [context.action].call(this, {
      documentId: context.documentId,
      populate: attributesToPrefetch,
      fields: ["documentId"],
      locale: context.locale,
    })

  const entries = Array.isArray(prefetchedData)
    ? prefetchedData
    : [prefetchedData]

  const componentsToPopulate = {}

  for (const attr of dynamicZonePopulate) {
    const components = new Set<string>()

    for (const entry of entries) {
      const zone = entry?.[attr]
      if (!Array.isArray(zone)) continue

      for (const block of zone) {
        if (block?.__component) {
          components.add(block.__component)
        }
      }
    }

    componentsToPopulate[attr] = [...components]
  }

  return componentsToPopulate
}
