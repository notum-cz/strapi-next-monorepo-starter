import { Modules } from "@strapi/strapi"

export const PAGE_POPULATE_OBJECT: Modules.Documents.ServiceParams<"api::page.page">["findOne"]["populate"] =
  {
    content: {
      on: {
        "sections.image-with-cta-button": {
          populate: { image: { populate: { media: true } }, link: true },
        },
        "sections.horizontal-images": {
          populate: {
            images: {
              populate: { image: { populate: { media: true } }, link: true },
            },
          },
        },
        "sections.hero": {
          populate: {
            links: true,
            image: { populate: { media: true } },
            steps: true,
          },
        },
        "sections.heading-with-cta-button": { populate: { cta: true } },
        "sections.faq": { populate: { accordions: true } },
        "sections.carousel": {
          populate: {
            images: {
              populate: { image: { populate: { media: true } }, link: true },
            },
          },
        },
        "sections.animated-logo-row": {
          populate: { logos: { populate: { media: true } } },
        },
        "forms.newsletter-form": { populate: { gdpr: true } },
        "forms.contact-form": { populate: { gdpr: true } },
        "utilities.ck-editor-content": true,
      },
    },
    seo: {
      populate: {
        metaImage: true,
        twitter: { populate: { images: true } },
        og: { populate: { image: true } },
      },
    },
  }
