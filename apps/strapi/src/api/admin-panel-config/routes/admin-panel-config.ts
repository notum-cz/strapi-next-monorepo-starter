export default {
  routes: [
    {
      method: "GET",
      path: "/admin-panel-config",
      handler: "admin-panel-config.getAdminPanelConfig",
      /**
       * Authentication for this endpoint is handler by the controller.
       * The token is configured via the ADMIN_PANEL_CONFIG_API_AUTH_TOKEN env variable.
       *
       * This is being called from the bootstrap phase of the admin panel,
       * so we cannot use Strapi's built-in auth mechanism here.
       */
      config: { auth: false },
    },
  ],
}
