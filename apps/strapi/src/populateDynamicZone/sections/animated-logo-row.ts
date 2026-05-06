import type { Modules } from "@strapi/strapi"

import basicImagePopulate from "../utilities/basic-image"

export default {
  populate: { logos: basicImagePopulate },
} as Modules.Documents.Params.Populate.NestedParams<"sections.animated-logo-row">
