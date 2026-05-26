import type { Data } from "@repo/strapi-types"

import StrapiHeadingWithCTAButton from "@/components/page-builder/components/sections/StrapiHeadingWithCTAButton"

const data = {
  id: 1,
  __component: "sections.heading-with-cta-button",
  title: "Heading with CTA",
  subtitle: "Short subtitle",
  cta: {
    id: 1,
    type: "external",
    label: "Get started",
    href: "https://example.com",
    newTab: true,
    decorations: null,
  },
} as unknown as Data.Component<"sections.heading-with-cta-button">

export default function MockedStrapiHeadingWithCTAButton() {
  return <StrapiHeadingWithCTAButton component={data} />
}
