import { Data } from "@repo/strapi-types"

import CkEditorRenderer from "@/components/elementary/ck-editor"
import { Container } from "@/components/elementary/Container"
import StrapiLink from "@/components/page-builder/components/utilities/StrapiLink"
import { Typography } from "@/components/typography"

export function StrapiHero({
  component,
}: {
  readonly component: Data.Component<"sections.hero">
}) {
  const { title, description, bgColor, links, tag, note } = component
  return (
    <section style={{ backgroundColor: bgColor ?? "transparent" }}>
      <Container className="flex flex-col gap-6 px-4 py-8 md:flex-row lg:py-12 xl:gap-0">
        <div className="mx-auto flex w-3/4 flex-col items-center justify-center gap-4">
          {tag && (
            <div className="flex items-center justify-center rounded-full border bg-white/30 px-3 py-1 shadow-sm backdrop-blur-md">
              <CkEditorRenderer htmlContent={tag} />
            </div>
          )}
          <Typography tag="h1" variant="heading1" className="text-center">
            {title}
          </Typography>
          {description && <CkEditorRenderer htmlContent={description} />}
          {links && (
            <div className="flex flex-col gap-2 pt-4 lg:flex-row lg:gap-4">
              {links.map((link, i) => (
                <StrapiLink
                  key={i}
                  component={link}
                  className="inline-flex w-full items-center justify-center rounded-lg bg-neutral-900 px-5 py-3 text-base font-medium text-white transition-colors hover:bg-neutral-800 focus:ring-2 focus:ring-neutral-400 focus:outline-none lg:w-fit"
                />
              ))}
            </div>
          )}
          <CkEditorRenderer htmlContent={note} />
        </div>
      </Container>
    </section>
  )
}

StrapiHero.displayName = "StrapiHero"

export default StrapiHero
