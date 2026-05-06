import type { Modules } from "@strapi/strapi"

export default {
  populate: { gdpr: true },
} as Modules.Documents.Params.Populate.NestedParams<"forms.contact-form">
