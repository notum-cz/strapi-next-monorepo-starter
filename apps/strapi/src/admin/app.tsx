import { setPluginConfig } from "@_sh/strapi-plugin-ckeditor"

import type { StrapiApp } from "@strapi/strapi/admin"

import { cs } from "./cs"

import "@repo/design-system/styles.css"

import { defaultCkEditorConfig } from "./ckeditor/configs"
import InternalJobsActions from "./extensions/InternalJobs"

export default {
  config: {
    locales: ["en", "cs"],
    translations: {
      cs,
    },
  },
  bootstrap(app: StrapiApp) {
    app.getPlugin("content-manager").injectComponent("listView", "actions", {
      name: "InternalJobsRunAction",
      Component: InternalJobsActions,
    })
  },
  register() {
    setPluginConfig({ presets: [defaultCkEditorConfig] })
  },
}
