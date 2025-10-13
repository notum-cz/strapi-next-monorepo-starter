import { Event } from "@strapi/database/dist/lifecycles"
import { Core } from "@strapi/strapi"

const crypto = require("crypto")

export const registerUserSubscriber = async ({
  strapi,
}: {
  strapi: Core.Strapi
}) => {
  strapi.db.lifecycles.subscribe({
    models: ["plugin::users-permissions.user"],

    async afterCreate(event) {
      await sendEmail(strapi, event)
    },
  })
}

/**
 * Send email after registration as user.
 * Email is sent if `confirmed` attribute is false:
 *  - if the user is created from the admin panel - `confirmed` is set by the admin in Strapi
 *  - if the user is created via "/auth/local/register" - `confirmed` is always set to true by default
 */
const sendEmail = async (strapi: Core.Strapi, event: Event) => {
  const { email, documentId, firstName, lastName, confirmed } =
    event.result ?? {}

  if (confirmed) {
    // do not send email if the user is already confirmed
    console.log(`User ${email} is already confirmed. Skipping email.`)
    return
  }

  if (!email || !documentId) {
    return
  }

  const feAccountActivationUrl = process.env.CLIENT_ACCOUNT_ACTIVATION_URL
  if (!feAccountActivationUrl) {
    console.warn(
      "CLIENT_ACCOUNT_ACTIVATION_URL is not set. After creation email will not be sent."
    )
    return
  }

  const name = [firstName, lastName].filter(Boolean).join(" ")
  const resetPasswordToken: string = crypto.randomBytes(64).toString("hex")

  try {
    await strapi.documents("plugin::users-permissions.user").update({
      documentId,
      data: { resetPasswordToken },
    })

    const html = `<h2>Welcome to our community!</h2> <h3>We have created an account for you</h3><p>
             We have automatically generated a password for you, please change it as soon as possible!
             You can change your password <a href="${feAccountActivationUrl}?code=${resetPasswordToken}&email=${email}&name=${name}" target="_blank">here</a>.
           </p>`

    await strapi.plugins["email"].services.email.send({
      to: email,
      subject: "Account Creation",
      html,
    })
  } catch (err) {
    // TODO: handle error
    console.log(err)
  }
}
