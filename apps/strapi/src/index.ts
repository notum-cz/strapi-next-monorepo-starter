import { GetValues } from "@strapi/types/dist/modules/entity-service/result"

import type { Core } from "@strapi/strapi"

const crypto = require("crypto")

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // Send email after registration to admin strapi panel
    // strapi.db.lifecycles.subscribe({
    //   models: ["admin::user"],
    //   async afterCreate(event) {
    //     const { email, registrationToken } = (event as any)
    //       .result as GetValues<"admin::user">
    //     if (registrationToken) {
    //       const html = `<h1>Vítejte mezi námi!</h1> <h3>Založili jsme Vám administrátorský účet</h3><p>
    //       Pro přístup do administrace klikněte <a href="${process.env.APP_URL}/admin/auth/register?registrationToken=${registrationToken}" target="_blank">ZDE</a>.
    //     </p>`
    //       try {
    //         await strapi.plugins["email"].services.email.send({
    //           to: email,
    //           subject: "Admin pozvánka do administrace",
    //           html,
    //         })
    //       } catch (e) {
    //         // TODO: handle error
    //         console.log(e)
    //       }
    //     }
    //   },
    // })
    // Send email after registration as user ()
    // strapi.db.lifecycles.subscribe({
    //   models: ["plugin::users-permissions.user"],
    //   async afterCreate(event) {
    //     const { email, id } = (event as any)
    //       .result as GetValues<"plugin::users-permissions.user">
    //     const resetPasswordToken: string = crypto
    //       .randomBytes(64)
    //       .toString("hex")
    //     try {
    //       await strapi.entityService.update(
    //         "plugin::users-permissions.user",
    //         id,
    //         { populate: "*", data: { resetPasswordToken } }
    //       )
    //       const html = `<h1>Vítejte mezi námi!</h1> <h3>Založili jsme Vám účet</h3><p>
    //             Heslo jsme Vám vytvořili automaticky, změňte si jej co nejdříve!
    //             Heslo změníte <a href="${process.env.CLIENT_ACCOUNT_ACTIVATION_URL}?code=${resetPasswordToken}&email=${email}" target="_blank">ZDE</a>.
    //           </p>`
    //       await strapi.plugins["email"].services.email.send({
    //         to: email,
    //         subject: "Vytvoření nového účtu",
    //         html,
    //       })
    //     } catch (err) {
    //       // TODO: handle error
    //       console.log(err)
    //     }
    //   },
    // })
  },
}
