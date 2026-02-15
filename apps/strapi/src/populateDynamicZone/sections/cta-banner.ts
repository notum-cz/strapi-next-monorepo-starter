import basicImagePopulate from "../utilities/basic-image"
import linkPopulate from "../utilities/link"

export default {
  populate: {
    links: linkPopulate,
    features: { populate: { image: basicImagePopulate } },
  },
}
