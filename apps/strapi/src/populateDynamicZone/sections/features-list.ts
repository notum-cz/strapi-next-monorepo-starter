import type { Modules } from "@strapi/strapi"

import basicImagePopulate from "../utilities/basic-image"

export default {
  populate: {
    features: {
      populate: { image: basicImagePopulate },
    },
    mainImage: { populate: { image: basicImagePopulate } },
  },
} satisfies Modules.Documents.Params.Populate.NestedParams<"sections.features-list">
