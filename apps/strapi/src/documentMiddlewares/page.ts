import { Modules } from "@strapi/strapi"

import { animatedLogoRowPopulate } from "./sections/AnimatedLogoRow"
import { carouselPopulate } from "./sections/Carousel"
import { contactFormPopulate } from "./sections/ContactForm"
import { faqPopulate } from "./sections/Faq"
import { headingWithCtaButtonPopulate } from "./sections/HeadingWithCtaButton"
import { heroPopulate } from "./sections/Hero"
import { horizontalImagesPopulate } from "./sections/HorizontalImages"
import { imageWithCtaButtonPopulate } from "./sections/ImageWithCtaButton"
import { newsletterFormPopulate } from "./sections/NewsletterForm"
import { seoPopulate } from "./seo-utilities/Seo"

const pageTypes = ["api::page.page"]
const pageActions = ["findMany"] // We're using findMany to find the pages, but this could be adjusted to findOne per your needs

/**
 * Registers a middleware to customize the population of related fields for page documents during Strapi queries.
 *
 * This middleware intercepts document queries for the "api::page.page" content type when the action is "findMany".
 * If the request parameters include pagination with { start: 0, limit: 1 } and a 'middlewarePopulate' array,
 * it selectively applies deep population rules for specified attributes, as defined in 'pagePopulateObject'.
 *
 * The request must contain 'middlewarePopulate' (array of string keys) in the 'params' object, which is going to be mapped to 'pagePopulateObject' attributes.
 *
 */
export const registerPopulatePageMiddleware = ({ strapi }) => {
  strapi.documents.use((context, next) => {
    if (
      pageTypes.includes(context.uid) &&
      pageActions.includes(context.action)
    ) {
      const requestParams: {
        start?: number
        limit?: number
        middlewarePopulate?: Array<string>
      } = context.params
      if (
        // This is added by Strapi regardless of whether you use pagination or start & limit attributes
        // This condition will be met if the request contains {pagination: {page: 1, pageSize: 1}}
        requestParams?.start === 0 &&
        requestParams?.limit === 1 &&
        Array.isArray(requestParams?.middlewarePopulate)
      ) {
        requestParams.middlewarePopulate
          .filter((populateAttr) =>
            Object.keys(pagePopulateObject).includes(populateAttr)
          )
          .forEach((populateAttr) => {
            context.params.populate[populateAttr] =
              pagePopulateObject[populateAttr]
          })
      }
    }

    return next()
  })
}

const pagePopulateObject: Modules.Documents.ServiceParams<"api::page.page">["findOne"]["populate"] =
  {
    content: {
      on: {
        "sections.image-with-cta-button": imageWithCtaButtonPopulate,
        "sections.horizontal-images": horizontalImagesPopulate,
        "sections.hero": heroPopulate,
        "sections.heading-with-cta-button": headingWithCtaButtonPopulate,
        "sections.faq": faqPopulate,
        "sections.carousel": carouselPopulate,
        "sections.animated-logo-row": animatedLogoRowPopulate,
        "forms.newsletter-form": newsletterFormPopulate,
        "forms.contact-form": contactFormPopulate,
        "utilities.ck-editor-content": true,
      },
    },
    seo: seoPopulate,
  }
