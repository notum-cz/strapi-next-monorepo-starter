import type { Data } from "@repo/strapi-types"

import StrapiCTABanner from "@/components/page-builder/components/sections/StrapiCTABanner"

const data = {
  id: 1,
  __component: "sections.cta-banner",
  title: "<h3>Call to action</h3>",
  description:
    "<p>A short description of a mocked component.A short description of a mocked component. A short description of a mocked component.  </p>",
  links: [
    {
      id: 1,
      type: "external",
      label: "Learn more",
      href: "https://example.com",
      newTab: true,
      decorations: {
        variant: "default",
      },
    },
  ],
} as unknown as Data.Component<"sections.cta-banner">

export default function MockedStrapiCTABanner() {
  return <StrapiCTABanner component={data} />
}
