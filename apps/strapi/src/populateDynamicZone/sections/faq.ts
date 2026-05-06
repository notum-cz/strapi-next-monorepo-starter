import type { Modules } from "@strapi/strapi"

export default {
  populate: { accordions: true },
} satisfies Modules.Documents.Params.Populate.NestedParams<"sections.faq">
