import type { Modules } from "@strapi/strapi"

export default {
  populate: { figures: true },
} as Modules.Documents.Params.Populate.NestedParams<"sections.statistics">
