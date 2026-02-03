import { basicImagePopulate } from "../utilities/BasicImage"
import { linkPopulate } from "../utilities/Link"

export const imageWithCtaButtonPopulate = {
  populate: { image: basicImagePopulate, link: linkPopulate },
} as const
