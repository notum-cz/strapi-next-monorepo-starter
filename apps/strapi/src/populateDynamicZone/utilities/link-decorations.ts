import type { Modules } from "@strapi/strapi"

import basicImagePopulate from "./basic-image"

export default {
  populate: {
    leftIcon: basicImagePopulate,
    rightIcon: basicImagePopulate,
  },
} as Modules.Documents.Params.Populate.NestedParams<"utilities.link-decorations">
