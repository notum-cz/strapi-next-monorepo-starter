import type { Data } from "@repo/strapi-types"

import { mockImage } from "@/app/[locale]/dev/showcase/components/StrapiMedia"
import StrapiCarousel from "@/components/page-builder/components/sections/StrapiCarousel"

const data = {
  id: 1,
  __component: "sections.carousel",
  images: [
    { id: 1, image: mockImage },
    { id: 2, image: mockImage },
    { id: 3, image: mockImage },
    { id: 4, image: mockImage },
  ],
} as unknown as Data.Component<"sections.carousel">

export default function MockedStrapiCarousel() {
  return <StrapiCarousel component={data} />
}
