import basicImagePopulate from "../utilities/basic-image"

export default {
  populate: {
    features: {
      populate: { image: basicImagePopulate },
    },
    mainImage: { populate: { image: basicImagePopulate } },
  },
}
