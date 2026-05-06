import type { Modules } from "@strapi/strapi"

import linkPopulate from "../utilities/link"

export default {
  populate: {
    links: linkPopulate,
  },
} satisfies Modules.Documents.Params.Populate.NestedParams<"sections.hero">
