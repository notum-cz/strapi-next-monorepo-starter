import { Data } from "@repo/strapi-types"

import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"
import { cn } from "@/lib/styles"
import CkEditorRenderer from "@/components/elementary/ck-editor"
import { Container } from "@/components/elementary/Container"
import { StrapiBasicImage } from "@/components/page-builder/components/utilities/StrapiBasicImage"

export function StrapiAnimatedLogoRow({
  component,
}: {
  readonly component: Data.Component<"sections.animated-logo-row">
}) {
  removeThisWhenYouNeedMe("StrapiAnimatedLogoRow")

  if (!component.logos) return null

  const imagesInViewport = 16
  const repeatCount =
    component.logos && component.logos.length > 0
      ? Math.max(2, Math.ceil(imagesInViewport / component.logos.length))
      : 2

  const repeatedRows = Array.from({ length: repeatCount }).map((_, i) => ({
    key: `slideshow-group-${i}`,
    logos: Array.isArray(component.logos) ? component.logos : [],
  }))

  return (
    <section className="w-full py-10">
      <Container className="flex flex-col items-center gap-[30px] overflow-hidden rounded-[2rem] bg-linear-to-r from-[#A54CE3]/10 to-[#ff8e8e]/10 py-10 shadow-sm">
        <CkEditorRenderer htmlContent={component.title} />

        <div className={cn("group relative mt-12 flex w-full items-center")}>
          {repeatedRows.map((row, rowIndex) => {
            const ulAriaHidden =
              row.logos?.length > imagesInViewport && rowIndex > 0
            return (
              <ul
                key={row.key}
                className="flex shrink-0 items-center ltr:animate-[marquee_linear_infinite] rtl:animate-[marqueeReverse_linear_infinite]"
                style={{
                  animationDuration: `${(row.logos?.length ?? 1) * 2}s`,
                }}
                aria-hidden={ulAriaHidden}
              >
                {row.logos?.map((logo, logoIndex) => (
                  <li
                    key={`slideshow-logo-${logo.id}`}
                    className="w-auto shrink-0 list-none px-5"
                    aria-hidden={logoIndex > imagesInViewport || ulAriaHidden}
                  >
                    <StrapiBasicImage
                      component={logo}
                      loading="eager"
                      className="object-contain grayscale"
                      height={40}
                    />
                  </li>
                ))}
              </ul>
            )
          })}
        </div>
      </Container>
    </section>
  )
}

StrapiAnimatedLogoRow.displayName = "StrapiAnimatedLogoRow"

export default StrapiAnimatedLogoRow
