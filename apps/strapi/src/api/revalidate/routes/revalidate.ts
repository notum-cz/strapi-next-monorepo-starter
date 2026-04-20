export default {
  routes: [
    {
      method: "POST",
      path: "/revalidate",
      handler: "revalidate.run",
      config: {
        auth: false, // Strapi-level auth is disabled; admin token is validated in the controller
      },
    },
  ],
}
