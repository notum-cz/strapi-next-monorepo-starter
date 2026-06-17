export default {
  routes: [
    {
      method: "GET",
      path: "/hierarchy/pending-changes",
      handler: "hierarchy.pendingChanges",
      config: {
        auth: false, // Strapi-level auth is disabled; admin token is validated in the controller
      },
    },
    {
      method: "POST",
      path: "/hierarchy/recalculate",
      handler: "hierarchy.recalculate",
      config: {
        auth: false, // Strapi-level auth is disabled; admin token is validated in the controller
      },
    },
  ],
}
