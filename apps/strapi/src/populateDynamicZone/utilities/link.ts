import type { Modules } from "@strapi/strapi"

import linkDecorationsPopulate from "./link-decorations"

export default {
  populate: {
    page: {
      fields: ["fullPath"],
    },
    decorations: linkDecorationsPopulate,
  },
} satisfies Modules.Documents.Params.Populate.NestedParams<"utilities.link">
