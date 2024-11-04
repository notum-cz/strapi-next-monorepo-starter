/**
 * configuration controller
 */
import { factories } from "@strapi/strapi"

export default factories.createCoreController(
  "api::configuration.configuration",
  ({ strapi }) => ({
    async demonstrativeCustomEndpoint(ctx) {
      // this will log error to Sentry automatically
      // throw new Error("Not implemented")

      // get sentry service
      const sentry = strapi.plugin("sentry").service("sentry")

      // manual error logging
      sentry.sendError(new Error("My custom error"))

      // get direct access to the Sentry instance
      const instance = sentry.getInstance()
      // call captureMessage or other Sentry functions (mentioned above)
      // pay attention, instance is undefined if Sentry is disabled (during development)
      instance?.captureMessage("My custom message")

      const config = await strapi
        .documents("api::configuration.configuration")
        .findFirst()
      console.log("Yey, TS is working! We have intellisense and type checking!")
      // console.log(config.notExistingProperty) // uncomment to see the error
      console.log(config.darkMode) // no error!

      return "Yey"
    },
  })
)
