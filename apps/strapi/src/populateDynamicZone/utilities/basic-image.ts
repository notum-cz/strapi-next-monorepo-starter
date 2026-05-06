import type { Modules } from "@strapi/strapi"

export default {
  populate: { media: true },
} satisfies Modules.Documents.Params.Populate.NestedParams<"utilities.basic-image">
