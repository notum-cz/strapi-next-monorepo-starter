import { Strapi } from "@strapi/strapi"

export default ({ strapi }: { strapi: Strapi }) => ({
  handleStripeWebhook(ctx) {
    ctx.body = strapi
      .plugin("stripe-integration")
      .service("paymentService")
      .handleStripeWebhook()
  },

  // This method should most likely not be exposed via the API, but rather used inside Strapi in another endpoint
  // createPayment(ctx) {
  //   ctx.body = strapi
  //     .plugin("stripe-integration")
  //     .service("paymentService")
  //     .createPayment(ctx.request.body)
  // },
})
