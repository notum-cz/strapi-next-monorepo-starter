import { setPluginConfig } from "@_sh/strapi-plugin-ckeditor"

import type { StrapiApp } from "@strapi/strapi/admin"

import { cs } from "./cs"

import "@repo/design-system/styles.css"

import { defaultCkEditorConfig } from "./ckeditor/configs"
import InternalJobs from "./extensions/InternalJobs"

export default {
  config: {
    locales: ["en", "cs"],
    translations: {
      cs,
    },
  },
  async bootstrap(app: StrapiApp) {
    app.getPlugin("content-manager").injectComponent("listView", "actions", {
      name: "InternalJobs",
      Component: InternalJobs,
    })

    const adminPanelConfigEnv = process.env.ADMIN_PANEL_CONFIG_API_AUTH_TOKEN
    if (adminPanelConfigEnv) {
      /**
       * Fetch admin panel config at runtime (e.g., theme settings)
       * and apply them to the admin panel.
       *
       * This can be used to inject CSS into the admin panel based on runtime env variables.
       * This is an example of usage, feel free to modify per your needs.
       */
      const configRequest = await fetch("/api/admin-panel-config", {
        headers: {
          Authorization: `Bearer ${process.env.ADMIN_PANEL_CONFIG_API_AUTH_TOKEN}`,
        },
      })
      if (configRequest.ok) {
        const configData = await configRequest.json()

        // Set the variable to the window object so it can be accessed globally
        // @ts-ignore
        window.ADMIN_PANEL_CONFIG = configData

        // Set data-theme attribute on document element so that we can potentially include CSS themes
        document.documentElement.setAttribute(
          "data-theme",
          configData.APP_BRAND.toLowerCase()
        )

        const colors =
          configData.APP_BRAND === "BRAND_A"
            ? { primary: "#123123", accent: "#234234" }
            : { primary: "#321321", accent: "#432432" }

        document.documentElement.style.setProperty(
          "--color-primary-default",
          colors.primary
        )
        document.documentElement.style.setProperty(
          "--color-accent-dark",
          colors.accent
        )
      } else {
        console.error(await configRequest.text())
      }
    }
  },
  register() {
    setPluginConfig({ presets: [defaultCkEditorConfig] })
  },
}
