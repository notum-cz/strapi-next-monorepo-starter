import type { Modules } from "@strapi/strapi"

import linkPopulate from "../utilities/link"

export default {
  populate: { cta: linkPopulate },
} satisfies Modules.Documents.Params.Populate.NestedParams<"sections.heading-with-cta-button">
