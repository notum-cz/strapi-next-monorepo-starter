import type { Data } from "@repo/strapi-types"

import { mockIcon } from "@/app/[locale]/dev/showcase/components/StrapiMedia"
import { StrapiFeaturesList } from "@/components/page-builder/components/sections/StrapiFeaturesList"

const baseData = {
  id: 1,
  __component: "sections.features-list",
  title: "<h3>Features Title</h3>",
  description: "<p>A short list of features</p>",
  features: [
    {
      id: 1,
      title: "<h3>Feature A</h3>",
      description: "<p>A short description of Feature A</p>",
      image: mockIcon,
    },
    {
      id: 2,
      title: "<h3>Feature B</h3>",
      description: "<p>A short description of Feature B</p>",
      image: mockIcon,
    },
  ],
} as unknown as Data.Component<"sections.features-list">

const variants: {
  key: string
  label: string
  data: Data.Component<"sections.features-list">
}[] = [
  {
    key: "list",
    label: "Variant: List",
    data: {
      ...baseData,
      listStyle: undefined,
    } as Data.Component<"sections.features-list">,
  },
  {
    key: "grid",
    label: "Variant: Grid",
    data: {
      ...baseData,
      listStyle: "grid",
    } as Data.Component<"sections.features-list">,
  },
  {
    key: "boxGrid",
    label: "Variant: Box Grid",
    data: {
      ...baseData,
      listStyle: "boxGrid",
    } as Data.Component<"sections.features-list">,
  },
]

export default function MockedStrapiFeaturesList() {
  return (
    <>
      {variants.map(({ key, data: d }) => (
        <StrapiFeaturesList component={d} key={key} />
      ))}
    </>
  )
}
