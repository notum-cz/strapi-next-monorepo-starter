/**
 * health service
 */

export default ({ strapi }) => ({
  // restarts the container if this route does not return 200/204
  liveness: async (ctx, next) => {
    ctx.status = 200
  },
})
