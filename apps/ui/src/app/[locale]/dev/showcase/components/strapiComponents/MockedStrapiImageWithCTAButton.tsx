import type { Data } from "@repo/strapi-types"

import { mockImage } from "@/app/[locale]/dev/showcase/components/StrapiMedia"
import StrapiImageWithCTAButton from "@/components/page-builder/components/sections/StrapiImageWithCTAButton"

const data = {
  id: 1,
  __component: "sections.image-with-cta-button",
  title: "Image with CTA",
  subText: "Short subtitle",
  image: mockImage,
  link: {
    id: 1,
    type: "external",
    label: "View",
    href: "https://example.com",
    newTab: true,
    decorations: null,
  },
} as Data.Component<"sections.image-with-cta-button">

export default function MockedStrapiImageWithCTAButton() {
  return <StrapiImageWithCTAButton component={data} />
}
