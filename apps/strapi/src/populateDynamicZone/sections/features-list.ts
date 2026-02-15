import basicImagePopulate from "../utilities/basic-image"

export default {
  populate: {
    features: {
      populate: { image: basicImagePopulate },
    },
    image: { populate: { image: { populate: { media: true } } } },
  },
}
