import { basicImagePopulate } from "../utilities/BasicImage"

export const featuresListPopulate = {
  populate: {
    features: {
      populate: { image: basicImagePopulate },
    },
    image: { populate: { image: { populate: { media: true } } } },
  },
} as const
