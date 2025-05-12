import { Data } from "@repo/strapi"

import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"
import { Container } from "@/components/elementary/Container"
import { StrapiBasicImage } from "@/components/page-builder/components/utilities/StrapiBasicImage"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

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
                className="px-2 pl-1 md:basis-1/2 lg:basis-1/3"
              >
                <div className="relative h-96 w-full lg:w-96">
                  <StrapiBasicImage
                    component={item.image}
                    className="object-contain"
                    fill
                  />
                </div>
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
