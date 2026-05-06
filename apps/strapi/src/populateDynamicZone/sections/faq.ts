import type { Modules } from "@strapi/strapi"

export default {
  populate: { accordions: true },
} as Modules.Documents.Params.Populate.NestedParams<"sections.faq">
