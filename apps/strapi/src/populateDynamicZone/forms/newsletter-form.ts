import type { Modules } from "@strapi/strapi"

export default {
  populate: { gdpr: true },
} satisfies Modules.Documents.Params.Populate.NestedParams<"forms.newsletter-form">
