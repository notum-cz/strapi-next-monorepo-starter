/**
 * This code is taken from https://github.com/NEDDL/strapi-v5-plugin-populate-deep
 */
import { UID } from "@strapi/strapi"

const { isEmpty, merge } = require("lodash/fp")

const skipCreatorFields = true

const getModelPopulationAttributes = (model: any) => {
  if (model.uid === "plugin::upload.file") {
    const { related, ...attributes } = model.attributes
    return attributes
  }

  return model.attributes
}

export const getFullPopulateObject = (
  modelUid: UID.Schema,
  maxDepth = 20,
  ignore?: string[]
) => {
  if (maxDepth <= 1) {
    return true
  }
  if (modelUid === "admin::user" && skipCreatorFields) {
    return undefined
  }

  const populate = {}
  const model = strapi.getModel(modelUid)
  if (ignore && !ignore.includes(model.collectionName)) {
    ignore.push(model.collectionName)
  }

  for (const [key, value] of Object.entries(
    getModelPopulationAttributes(model)
  ) as any) {
    if (ignore?.includes(key)) {
      continue
    }

    if (value) {
      if (value.type === "component") {
        populate[key] = getFullPopulateObject(value.component, maxDepth - 1)
      } else if (value.type === "dynamiczone") {
        const dynamicPopulate = value.components.reduce((prev, cur) => {
          const curPopulate = getFullPopulateObject(cur, maxDepth - 1)
          return merge(prev, { [cur]: curPopulate })
        }, {})
        populate[key] = isEmpty(dynamicPopulate)
          ? true
          : { on: dynamicPopulate }
      } else if (value.type === "relation") {
        const relationPopulate = getFullPopulateObject(
          value.target,
          key === "localizations" && maxDepth > 2 ? 1 : maxDepth - 1,
          ignore
        )
        if (relationPopulate) {
          populate[key] = relationPopulate
        }
      } else if (value.type === "media") {
        populate[key] = true
      }
    }
  }
  return isEmpty(populate) ? true : { populate }
}
