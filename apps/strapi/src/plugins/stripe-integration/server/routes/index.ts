export default [
  {
    method: "POST",
    path: "/handleStripeWebhook",
    handler: "paymentController.handleStripeWebhook",
    config: {
      auth: false,
    },
  },
]
