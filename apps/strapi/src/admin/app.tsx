import { StrapiApp } from "@strapi/strapi/admin"

import { cs } from "./cs"

export default {
  config: {
    locales: ["en", "cs"],
    translations: {
      cs,
    },
  },
  bootstrap(app: StrapiApp) {
    console.log(app)
  },
}
