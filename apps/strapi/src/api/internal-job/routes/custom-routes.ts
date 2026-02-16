export default {
  routes: [
    {
      method: "POST",
      path: "/internal-job/fullpaths/recalculate/all",
      handler: "internal-job.runRecalculateFullpathAll",
      config: {
        auth: false, // Strapi-level auth is disabled; admin token is validated in the controller
      },
    },
    {
      method: "POST",
      path: "/internal-job/redirects/create/all",
      handler: "internal-job.runCreateRedirectsAll",
      config: {
        auth: false, // Strapi-level auth is disabled; admin token is validated in the controller
      },
    },
  ],
}
