import { Core, UID } from "@strapi/strapi"

import { getFullPopulateObject } from "../utils/populate-deep"

// Ideally, we should NOT use populate-deep concept in the code.
// It is VERY expensive operation and should be avoided.
// TODO: find a way to avoid using populate-deep when fetching Page `content` field
// with many deep nested and different components.
export const registerPopulateDeepSubscriber = ({
  strapi,
}: {
  strapi: Core.Strapi
}) => {
  strapi.db.lifecycles.subscribe((event) => {
    if (event.action === "beforeFindMany" || event.action === "beforeFindOne") {
      // @ts-expect-error - deepLevel is custom parameter
      const deepLevel = event.params?.deepLevel
      // @ts-expect-error - deepLevelIgnore is custom parameter
      const deepLevelIgnore = event.params?.deepLevelIgnore ?? []

      if (deepLevel !== undefined && deepLevel > 0) {
        const modelObject = getFullPopulateObject(
          event.model.uid as UID.Schema,
          deepLevel,
          deepLevelIgnore
        )

        if (modelObject && typeof modelObject === "object") {
          event.params.populate = {
            ...event.params.populate,
            ...modelObject.populate,
          }

          //   console.dir(event.params.populate, { depth: null })
        }
      }
    }
  })
}
