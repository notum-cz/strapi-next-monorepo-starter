import linkDecorationsPopulate from "./link-decorations"

export default {
  populate: {
    page: {
      fields: ["fullPath"],
    },
    decorations: linkDecorationsPopulate,
  },
}
