import { basicImagePopulate } from "../utilities/BasicImage"

export const ctaBannerPopulate = {
  populate: {
    links: true,
    features: { populate: { image: basicImagePopulate } },
  },
} as const
