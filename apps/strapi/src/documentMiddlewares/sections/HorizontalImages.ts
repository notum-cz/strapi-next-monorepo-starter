import { basicImagePopulate } from "../utilities/BasicImage"
import { linkPopulate } from "../utilities/Link"

export const horizontalImagesPopulate = {
  populate: {
    images: {
      populate: { image: basicImagePopulate, link: linkPopulate },
    },
  },
} as const
