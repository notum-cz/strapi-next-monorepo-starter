// https://docs.strapi.io/dev-docs/configurations/cron

const sayHelloJob = {
  task: ({ strapi }) => {
    // Add your own logic here (e.g. send a queue of email, create a database backup, etc.).
    console.log("A beautiful start to the week!")
  },
  /**
   * Simple example.
   * Every monday at 1am.
   */
  options: {
    rule: "0 0 1 * * 1",
  },
}

export default {
  sayHelloJob,
}
