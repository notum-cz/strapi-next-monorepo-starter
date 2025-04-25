import { StrapiApp } from "@strapi/strapi/admin"
import { setPluginConfig } from "@_sh/strapi-plugin-ckeditor"

import { ckEditorConfig } from "./ckeditor"
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
  register() {
    setPluginConfig(ckEditorConfig)
  },
}
