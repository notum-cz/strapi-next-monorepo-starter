import { basicImagePopulate } from "../utilities/BasicImage"
import { linkPopulate } from "../utilities/Link"

export const heroPopulate = {
  populate: {
    links: linkPopulate,
    image: basicImagePopulate,
    steps: true,
  },
}
