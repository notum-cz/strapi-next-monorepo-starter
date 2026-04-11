import basicImagePopulate from "../utilities/basic-image"
import linkPopulate from "../utilities/link"

export default {
  populate: {
    events: {
      populate: {
        image: basicImagePopulate,
        ctaLink: linkPopulate,
        tags: true,
      },
    },
  },
}
