import { basicImagePopulate } from "./BasicImage"

export const linkDecorationsPopulate = {
  populate: {
    leftIcon: basicImagePopulate,
    rightIcon: basicImagePopulate,
  },
} as const
