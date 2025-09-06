import { FindOne } from "../../types"

const projectTypes = ["api::project.project"]
const projectActions = ["findOne"]

/**
 * Registers a middleware to customize the population of related fields for project documents during Strapi queries.
 */
export const registerPopulateProjectMiddleware = ({ strapi }) => {
  strapi.documents.use((context, next) => {
    if (
      projectTypes.includes(context.uid) &&
      projectActions.includes(context.action)
    ) {
      const requestParams: {
        middlewarePopulate?: Array<string>
      } = context.params

      if (Array.isArray(requestParams?.middlewarePopulate)) {
        requestParams.middlewarePopulate
          .filter((populateAttr) =>
            Object.keys(projectPopulateObject).includes(populateAttr)
          )
          .forEach((populateAttr) => {
            context.params.populate[populateAttr] =
              projectPopulateObject[populateAttr]
          })
      }
    }

    return next()
  })
}

const projectPopulateObject: FindOne<"api::project.project">["populate"] = {
  content: {
    on: {
      "sections.image-with-cta-button": {
        populate: { image: { populate: { media: true } }, link: true },
      },
      "sections.adaptive-gallery": {
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
      "sections.animated-logo-row": {
        populate: { logos: { populate: { media: true } } },
      },
      "sections.attachment-download": {
        populate: { file: true },
      },
      "sections.timeline": {
        populate: { milestones: true },
      },
      "sections.project-showcase": {
        populate: {
          projects: {
            populate: {
              image: true,
              tags: true,
              links: true,
            },
          },
        },
      },
      "forms.newsletter-form": { populate: { gdpr: true } },
      "forms.contact-form": { populate: { gdpr: true } },
      "utilities.ck-editor-content": true,
    },
  },
}
