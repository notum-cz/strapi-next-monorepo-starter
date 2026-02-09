import { errors } from "@strapi/utils"
import { pick } from "lodash/fp"

import { POPULATE_CONFIG } from "../populate-config"

const pageActions = ["findMany", "findOne", "findFirst"] // We're using findMany to find the pages, but this could be adjusted to findOne per your needs

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

const normalizedSmartPopulate = (
  toSmartPopulate: string[] | string | undefined
) => {
  if (!toSmartPopulate) {
    return []
  }
  if (typeof toSmartPopulate === "string") {
    return [toSmartPopulate]
  }
  return toSmartPopulate
}

const getPopulateConfig = (uid: string) => {
  const populateConfig = POPULATE_CONFIG[uid]
  if (!populateConfig) {
    throw new errors.ValidationError(
      `Populate config for '${uid}' not found, please add it to the 'POPULATE_CONFIG' object in the 'populate-config' file`
    )
  }
  return populateConfig
}

const extractComponentsToPopulate = (
  prefetchDataToPopulate: any,
  attributeToPopulate: string
) => {
  if (
    typeof prefetchDataToPopulate === "object" &&
    prefetchDataToPopulate[attributeToPopulate]
  ) {
    return prefetchDataToPopulate[attributeToPopulate].map(
      (component) => component.__component
    )
  }

  if (Array.isArray(prefetchDataToPopulate)) {
    return prefetchDataToPopulate.map((entry) => {
      return entry[attributeToPopulate].map(
        (component) => component.__component
      )
    })
  }

  return []
}

export const registerPopulatePageMiddleware = ({ strapi }) => {
  strapi.documents.use(async (context, next) => {
    if (!pageActions.includes(context.action)) {
      return next()
    }

    const isSmartPopulateEnabled =
      normalizedSmartPopulate(context.params.populateSmart).length > 0

    if (!isSmartPopulateEnabled) {
      return next()
    }

    const smartPopulate = normalizedSmartPopulate(context.params.populateSmart)

    const attributesNotExists = smartPopulate.filter(
      (populateAttr) =>
        context.contentType.attributes[populateAttr] === undefined
    )

    if (attributesNotExists.length > 0) {
      throw new errors.ValidationError(
        `Attributes '${attributesNotExists.join(", ")}' do not exist`
      )
    }

    // Remove populateSmart to stop propagation
    delete context.params.populateSmart

    const populateConfig = getPopulateConfig(context.uid)

    const attributesToPrefetch = smartPopulate.reduce((acc, attr) => {
      return {
        ...acc,
        [attr]: true,
      }
    }, {})

    const prefetchDataToPopulate = await strapi
      .documents(context.uid)
      [context.action].call(this, {
        documentId: context.documentId,
        populate: attributesToPrefetch,
        fields: ["documentId"],
        locale: context.locale,
      })

    const componentsToPopulate = extractComponentsToPopulate(
      prefetchDataToPopulate,
      "content"
    )

    const populationObject = pick(
      componentsToPopulate,
      populateConfig.content.on
    )

    const contentPopulate = {
      content: {
        on: populationObject,
      },
    }

    context.params.populate = {
      ...context.params.populate,
      ...contentPopulate,
    }

    return next()
  })

  // strapi.documents.use((context, next) => {
  //   if (
  //     pageTypes.includes(context.uid) &&
  //     pageActions.includes(context.action)
  //   ) {
  //     const requestParams: {
  //       start?: number
  //       limit?: number
  //       middlewarePopulate?: Array<string>
  //     } = context.params
  //     if (
  //       // This is added by Strapi regardless of whether you use pagination or start & limit attributes
  //       // This condition will be met if the request contains {pagination: {page: 1, pageSize: 1}}
  //       requestParams?.start === 0 &&
  //       requestParams?.limit === 1 &&
  //       Array.isArray(requestParams?.middlewarePopulate)
  //     ) {
  //       requestParams.middlewarePopulate
  //         .filter((populateAttr) =>
  //           Object.keys(pagePopulateObject).includes(populateAttr)
  //         )
  //         .forEach((populateAttr) => {
  //           context.params.populate[populateAttr] =
  //             pagePopulateObject[populateAttr]
  //         })
  //     }
  //   }

  //   return next()
  // })
}
