/**
 * configuration controller
 */
import { factories } from "@strapi/strapi"

export default factories.createCoreController(
  "api::configuration.configuration",
  ({ strapi }) => ({
    async demonstrativeCustomEndpoint(ctx) {
      const config = await strapi.entityService.findOne(
        "api::configuration.configuration",
        1
      )
      console.log("Yey, TS is working! We have intellisense and type checking!")
      // console.log(config.notExistingProperty) // uncomment to see the error
      console.log(config.darkMode) // no error!

      return "Yey"
    },
  })
)
