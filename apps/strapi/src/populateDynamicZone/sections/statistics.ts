import type { Modules } from "@strapi/strapi"

export default {
  populate: { figures: true },
} satisfies Modules.Documents.Params.Populate.NestedParams<"sections.statistics">
