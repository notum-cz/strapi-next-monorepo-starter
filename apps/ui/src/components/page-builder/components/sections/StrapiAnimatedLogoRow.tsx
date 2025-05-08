import { Data } from "@repo/strapi"

import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"
import { cn } from "@/lib/styles"
import { StrapiBasicImage } from "@/components/page-builder/components/utilities/StrapiBasicImage"
import Heading from "@/components/typography/Heading"

export function StrapiAnimatedLogoRow({
  component,
}: {
  readonly component: Data.Component<"sections.animated-logo-row">
}) {
  removeThisWhenYouNeedMe("StrapiAnimatedLogoRow")

  if (!component.logos) return null

  const sliderImages = [...component.logos, ...component.logos]

  return (
    <section className="w-full py-10">
      <div className="flex flex-col items-center gap-[30px]">
        <Heading tag="h3" variant="heading4" fontWeight="normal">
          {component.text}
        </Heading>

        <div className="relative mt-4 w-full">
          <div className="infinite-scroll-container-horizontal w-full">
            <div
              className={cn(
                "infinite-scroll-horizontal flex gap-14 overflow-hidden",
                component.logos?.length > 10 && "justify-center"
              )}
            >
              {sliderImages.map((logo, index) => (
                <div key={String(logo.id) + index} className="grayscale">
                  <StrapiBasicImage
                    component={logo}
                    forcedSizes={{ width: 200 }}
                    priority={index < 10}
                    loading="eager"
                    className="z-10 max-h-10 w-full object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gradient-slider absolute top-0 left-0 size-full opacity-80" />
        </div>
      </div>
    </section>
  )
}

StrapiAnimatedLogoRow.displayName = "StrapiAnimatedLogoRow"

export default StrapiAnimatedLogoRow
