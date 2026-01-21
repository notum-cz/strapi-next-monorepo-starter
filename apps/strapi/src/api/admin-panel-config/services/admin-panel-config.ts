/**
 * admin-panel-config service
 */

export default ({ strapi }) => ({
  getAdminPanelConfig: async () => {
    // you can include any env variable which should be available in the admin panel, but configured during the runtime instead of buildtime
    return {
      APP_BRAND: process.env.APP_BRAND || "UNKNOWN",
    }
  },
})
