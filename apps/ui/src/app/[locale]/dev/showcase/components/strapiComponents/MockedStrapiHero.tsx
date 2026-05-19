import type { Data } from "@repo/strapi-types"

import StrapiHero from "@/components/page-builder/components/sections/StrapiHero"

const data = {
  id: 1,
  __component: "sections.hero",
  title:
    '<h1 style="text-align:center;"><strong>Strapi + Next.js Starter Production-ready on Day 1</strong></h1>',
  description:
    '<p style="text-align:center;">Open-source, battle-tested starter that helps you ship patterns that scale. It combines the power of<strong> Strapi, Next.js, Shadcn/ui libraries</strong> with Turborepo setup and kickstarts your project development</p>',
  links: [
    {
      id: 1,
      type: "external",
      label: "Get the code on github",
      href: "https://github.com/notum-cz/strapi-next-monorepo-starter",
      newTab: true,
      decorations: null,
    },
  ],
  tag: '<p style="text-align:center;"><strong>Powers project with 500K monthly views</strong></p>',
  note: '<p style="text-align:center;">Built and battle-tested by <span style="color:hsl(275, 73%, 59%);"><strong>Notum, Official Strapi Partner.</strong></span></p>',
} as unknown as Data.Component<"sections.hero">

export default function MockedStrapiHero() {
  return <StrapiHero component={data} />
}
