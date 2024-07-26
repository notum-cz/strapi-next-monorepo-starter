import { Common, Entity, Strapi } from "@strapi/strapi"
import { errors } from "@strapi/utils"
import Stripe from "stripe"

import { PaymentIntentMetadata } from "../types"

const { NotFoundError, ApplicationError, ForbiddenError } = errors

const stripeKey = process.env.STRIPE_KEY || ""
const stripe = new Stripe(stripeKey, {
  apiVersion: "2024-04-10",
})

// It's impossible to prepare stripe for any project in advance, therefore this is just a template
// You will need to design & implement the logic to handle items, pricing and orders
// You should keep in mind that in any order, the current status of item should be persisted (e.g. a JSON.stringify of the order items)
// in case it could change price or any other aspect
// for any questions regarding stripe integration, you can consult Dominik J or Michelle J

export default ({ strapi }: { strapi: Strapi }) => ({
  async markOrderAsPaidByCard(props: {
    intentId: string
    metadata: PaymentIntentMetadata
  }) {
    if (!strapi?.entityService) {
      throw new ApplicationError("Entity service is not available")
    }

    // TODO Modify your order update logic here
    // const orderUpdate = await strapi.entityService.update(
    //   "api::credit-order.credit-order",
    //   parseInt(props.metadata.orderId),
    //   {
    //     data: {
    //       status: "completed",
    //       paymentIntentId: props.intentId,
    //     },
    //   }
    // )
    console.log({ markOrderAsPaidByCard: props })
  },

  async markOrderAsFailed(props: {
    intentId: string
    metadata: PaymentIntentMetadata
  }) {
    if (!strapi?.entityService) {
      throw new ApplicationError("Entity service is not available")
    }

    // TODO Modify your order update logic here
    // await strapi.entityService.update(
    //   "api::credit-order.credit-order",
    //   parseInt(props.metadata.orderId),
    //   { data: { status: "failed" } }
    // )

    console.log({ markOrderAsFailed: props })
  },

  async handleStripeWebhook(payload: { type: string } & Record<string, any>) {
    /**
     * To gain an understanding of this logic, please refer to the documentation on payment intents
     * https://docs.stripe.com/api/payment_intents
     *
     * The jist of it is that we are listening for events related to our payment
     * There are multiple event types (e.g. payment intent, invoice, etc) and each has multiple events
     * In development mode, these intents are all sent from the API, but in production, you need to specify which
     * events you want to listen to in the stripe dashboard (make sure that all the events which are specified in this method are enabled!)
     *
     * You should run the yarn stripe:local command inside another terminal to run the Stripe listener
     *  - you need to have the Stripe CLI installed
     */

    const hookType = payload.type

    if (hookType.includes("payment_intent")) {
      const intent = await retrievePaymentIntentMeta({
        paymentIntentId: payload.data.object.id,
      })

      if (hookType === "payment_intent.succeeded") {
        await this.markOrderAsPaidByCard(intent)
      } else if (hookType === "payment_intent.payment_failed") {
        await this.markOrderAsFailed(intent)
      }
    }

    if (hookType.includes("invoice")) {
      if (hookType === "invoice.created") {
        await this.addInvoiceToOrder(payload.data.object)
      }
    }

    return {}
  },

  async createPayment(params: {
    user: {
      id: number
    }
    data: {
      entityUid: Common.UID.CollectionType
      entityId: Entity.ID
    }
  }) {
    if (!params.user.id) {
      throw new ForbiddenError("You need to log in!")
    }
    if (!strapi?.entityService) {
      throw new ApplicationError("Entity service is not available")
    }
    const item = await strapi.entityService.findOne(
      params.data.entityUid,
      params.data.entityId,
      {
        fields: [],
        populate: {},
      }
    )

    if (!item) {
      throw new Error("Invalid Item")
    }
    // Determine Currency
    const user = await strapi.entityService.findOne(
      "plugin::users-permissions.user",
      params.user.id,
      { fields: ["email", "stripeId"] }
    )

    if (!user) {
      throw new NotFoundError("User not found")
    }

    let stripeCustomerId = user.stripeId

    if (!stripeCustomerId) {
      // We do not add the stripeId property by default
      // To make this work, you need to modify user via content type manager
      // const stripeCustomer = await stripe.customers.create({
      //   email: user.email,
      // })
      // await strapi.entityService.update(
      //   "plugin::users-permissions.user",
      //   params.user.id,
      //   { data: { stripeId: stripeCustomer.id } }
      // )
      // stripeCustomerId = stripeCustomer.id
    }

    // const newOrder = await strapi.entityService.create("api::order.order", {
    //   data: {
    //     user: params.user.id,
    //     item,
    //     status: "created",
    //   },
    // })

    const payment = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            unit_amount: item.price * 100,
            product_data: {
              name: item.title,
            },
            currency: item.currency,
          },
          quantity: 1,
        },
      ],

      tax_id_collection: {
        enabled: true,
      },

      automatic_tax: {
        enabled: true,
      },

      invoice_creation: {
        enabled: true,
        invoice_data: {
          metadata: {
            // orderId: newOrder.id,
          },
        },
      },
      shipping_address_collection: {
        // Apple pay won't work without specifying allowed countries
        allowed_countries: ["CZ", "SK", "DE", "AT", "PL", "FR", "IT", "GB"],
      },

      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/payment-success`,
      cancel_url: `${process.env.CLIENT_URL}/payment-failed`,

      billing_address_collection: "required",

      phone_number_collection: {
        enabled: true,
      },

      payment_intent_data: {
        metadata: {
          // orderId: newOrder.id,
          userId: params.user.id,
        },
      },

      consent_collection: {
        // terms_of_service: "required",
      },

      customer: stripeCustomerId,
      customer_update: {
        name: "auto",
        address: "auto",
        shipping: "auto",
      },
    })
    return {
      // ...newOrder,
      stripePaymentUrl: payment.url as string,
    }
  },
})

const retrievePaymentIntent = async (props: {
  paymentIntentId: string
}): Promise<Stripe.Response<Stripe.PaymentIntent>> => {
  return await stripe.paymentIntents.retrieve(props.paymentIntentId)
}

const retrievePaymentIntentMeta = async (props: {
  paymentIntentId: string
}): Promise<{
  intentId: string
  metadata: PaymentIntentMetadata
}> => {
  const paymentIntent = await retrievePaymentIntent({
    paymentIntentId: props.paymentIntentId,
  })
  return {
    intentId: props.paymentIntentId,
    metadata: paymentIntent.metadata as PaymentIntentMetadata,
  }
}
