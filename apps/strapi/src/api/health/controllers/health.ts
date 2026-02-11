/**
 * A set of functions called "actions" for `health`
 */

export default {
  find: async (ctx, next) => {
    return await strapi.service("api::health.health").liveness(ctx, next)
  },
}
