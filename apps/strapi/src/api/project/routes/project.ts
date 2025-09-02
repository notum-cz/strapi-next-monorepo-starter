export default {
  routes: [
    {
      method: "GET",
      path: "/projects",
      handler: "project.find",
    },
    {
      method: "GET",
      path: "/projects/:id",
      handler: "project.findOne",
    },
  ],
}
