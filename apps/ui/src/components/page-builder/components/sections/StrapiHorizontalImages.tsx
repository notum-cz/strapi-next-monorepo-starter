"use client"

import { useState } from "react"
import { Data } from "@repo/strapi"

import { Container } from "@/components/elementary/Container"
import { StrapiBasicImage } from "@/components/page-builder/components/utilities/StrapiBasicImage"
import StrapiLink from "@/components/page-builder/components/utilities/StrapiLink"
import { ImageGallery } from "@/components/ui/ImageGallery"

export function StrapiHorizontalImages({
  component,
}: {
  readonly component: Data.Component<"sections.horizontal-images">
}) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  return (
    <section>
      <Container className="py-8">
        <div className="flex flex-col items-center">
          <p className="mb-6 text-center tracking-tight text-gray-900">
            {component.title}
          </p>

          <div className="flex gap-4 overflow-x-auto pb-4">
            {component.images?.map((x, i) => (
              <div key={String(x.id) + i} className="flex-shrink-0 p-1">
                {x.link ? (
                  <StrapiLink component={x.link} className="block h-auto p-0">
                    <StrapiBasicImage
                      component={x.image}
                      className="rounded-lg object-cover"
                      forcedSizes={{
                        width: component.fixedImageWidth || 300,
                        height: component.fixedImageHeight || 200,
                      }}
                    />
                  </StrapiLink>
                ) : (
                  <button
                    type="button"
                    className="cursor-pointer border-0 bg-transparent p-0 outline-none focus:ring-2 focus:ring-red-500/50 rounded-lg"
                    onClick={() => setSelectedImage(i)}
                  >
                    <StrapiBasicImage
                      component={x.image}
                      className="rounded-lg object-cover transition-opacity hover:opacity-80"
                      forcedSizes={{
                        width: component.fixedImageWidth || 300,
                        height: component.fixedImageHeight || 200,
                      }}
                    />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </Container>

      <ImageGallery
        images={component.images || []}
        selectedImage={selectedImage}
        onClose={() => setSelectedImage(null)}
        onSelectImage={setSelectedImage}
      />
    </section>
  )
}

StrapiHorizontalImages.displayName = "StrapiHorizontalImages"

export default StrapiHorizontalImages
