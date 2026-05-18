import type { Data } from "@repo/strapi-types"

import { mockImage } from "@/app/[locale]/dev/showcase/components/StrapiMedia"
import StrapiAnimatedLogoRow from "@/components/page-builder/components/sections/StrapiAnimatedLogoRow"

const data = {
  id: 1,
  __component: "sections.animated-logo-row",
  title: "<h3>Our partners</h3>",
  logos: [mockImage, mockImage, mockImage, mockImage],
} as unknown as Data.Component<"sections.animated-logo-row">

export default function MockedStrapiAnimatedLogoRow() {
  return <StrapiAnimatedLogoRow component={data} />
}
