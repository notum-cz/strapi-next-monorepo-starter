export default {
  routes: [
    {
      method: "GET",
      path: "/admin-panel-config",
      handler: "admin-panel-config.getAdminPanelConfig",
      config: { auth: false },
    },
  ],
}
