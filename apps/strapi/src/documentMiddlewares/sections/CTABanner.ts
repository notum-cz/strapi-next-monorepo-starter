import { basicImagePopulate } from "../utilities/BasicImage"
import { linkPopulate } from "../utilities/Link"

export const ctaBannerPopulate = {
  populate: {
    links: linkPopulate,
    features: { populate: { image: basicImagePopulate } },
  },
} as const
