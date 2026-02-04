import { Data } from "@repo/strapi-types"

import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"
import { cn } from "@/lib/styles"
import { StrapiBasicImage } from "@/components/page-builder/components/utilities/StrapiBasicImage"
import { Typography } from "@/components/typography"

export function StrapiAnimatedLogoRow({
  component,
}: {
  readonly component: Data.Component<"sections.animated-logo-row">
}) {
  removeThisWhenYouNeedMe("StrapiAnimatedLogoRow")

  if (!component.logos) return null

  const imagesInViewport = 6
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
      <div className="flex flex-col items-center gap-[30px]">
        <Typography tag="h3" variant="heading4" fontWeight="normal">
          {component.text}
        </Typography>

        <div className={cn("group relative flex items-center overflow-hidden")}>
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
                      className="object-contain"
                      height={40}
                    />
                  </li>
                ))}
              </ul>
            )
          })}
        </div>
      </div>
    </section>
  )
}

StrapiAnimatedLogoRow.displayName = "StrapiAnimatedLogoRow"

export default StrapiAnimatedLogoRow
