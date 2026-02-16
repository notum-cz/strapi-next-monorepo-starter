/**
 * A set of functions called "actions" for `admin-panel-config`
 */

const AUTH_TOKEN = process.env.ADMIN_PANEL_CONFIG_API_AUTH_TOKEN

export default {
  getAdminPanelConfig: async (ctx, next) => {
    if (!AUTH_TOKEN) {
      ctx.forbidden("Authorization token is not set")

      return
    }

    if (ctx.request.headers.authorization !== `Bearer ${AUTH_TOKEN}`) {
      ctx.forbidden("Invalid authorization token")

      return
    }

    const response = await strapi
      .service("api::admin-panel-config.admin-panel-config")
      .getAdminPanelConfig()

    return response
  },
}
