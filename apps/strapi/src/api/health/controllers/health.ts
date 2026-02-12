/**
 * A set of functions called "actions" for `health`
 */

export default {
  find: async (ctx) => {
    ctx.body = { status: "OK" }
  },
}
