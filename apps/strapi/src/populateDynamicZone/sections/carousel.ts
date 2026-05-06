import type { Modules } from "@strapi/strapi"

import basicImagePopulate from "../utilities/basic-image"
import linkPopulate from "../utilities/link"

export default {
  populate: {
    images: {
      populate: { image: basicImagePopulate, link: linkPopulate },
    },
  },
} satisfies Modules.Documents.Params.Populate.NestedParams<"sections.carousel">
