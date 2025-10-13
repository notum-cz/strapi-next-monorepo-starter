export default {
  routes: [
    {
      method: "POST",
      path: "/internal-job/fullpaths/recalculate/all",
      handler: "internal-job.runRecalculateFullpathAll",
      config: {
        auth: false, // TODO: Solve this properly to not allow jobs without authentication
      },
    },
    {
      method: "POST",
      path: "/internal-job/redirects/create/all",
      handler: "internal-job.runCreateRedirectsAll",
      config: {
        auth: false, // TODO: Solve this properly to not allow jobs without authentication
      },
    },
  ],
}
