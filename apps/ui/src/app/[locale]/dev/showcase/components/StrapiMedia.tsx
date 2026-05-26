import type { Data } from "@repo/strapi-types"

export const mockImage = {
  id: 1,
  __component: "utilities.basic-image",
  alt: "Placeholder",
  width: 600,
  height: 400,
  media: null,
  fallbackSrc: "/images/placeholder.png",
} as unknown as Data.Component<"utilities.basic-image">

export const mockIcon = {
  id: 1,
  __component: "utilities.basic-image",
  alt: "Placeholder",
  width: 24,
  height: 24,
  media: null,
  fallbackSrc: "/images/mockedIcon.png",
} as unknown as Data.Component<"utilities.basic-image">

export default { mockImage, mockIcon }
