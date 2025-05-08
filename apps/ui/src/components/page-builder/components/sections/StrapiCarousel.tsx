import { Data } from "@repo/strapi"

import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"
import { cn } from "@/lib/styles"
import { Container } from "@/components/elementary/Container"
import { StrapiImageWithLink } from "@/components/page-builder/components/utilities/StrapiImageWithLink"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

const DEFAULT_IMG_SIZE = 610

export function StrapiCarousel({
  component,
}: {
  readonly component: Data.Component<"sections.carousel">
}) {
  removeThisWhenYouNeedMe("StrapiCarousel")

  return (
    <section>
      <Container className="flex justify-center px-4 py-8">
        <Carousel className="w-full">
          <CarouselContent className="-ml-1">
            {component.images?.map((item, index) => (
              <CarouselItem
                key={String(item.id) + index}
                className="pl-1 md:basis-1/2 lg:basis-1/3"
              >
                <StrapiImageWithLink
                  component={item}
                  imageProps={{
                    className: cn(
                      "mb-2 object-contain",
                      component?.radius && `rounded-${component.radius}`
                    ),
                    forcedSizes: {
                      height: DEFAULT_IMG_SIZE,
                      width: DEFAULT_IMG_SIZE,
                    },
                  }}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </Container>
    </section>
  )
}

StrapiCarousel.displayName = "StrapiCarousel"

export default StrapiCarousel
