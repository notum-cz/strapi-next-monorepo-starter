"use client"

import { useState } from "react"
import { Data } from "@repo/strapi"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Container } from "@/components/elementary/Container"
import { StrapiBasicImage } from "@/components/page-builder/components/utilities/StrapiBasicImage"
import StrapiLink from "@/components/page-builder/components/utilities/StrapiLink"
import { ImageGallery } from "@/components/ui/ImageGallery"

export function StrapiAdaptiveGallery({
  component,
}: {
  readonly component: Data.Component<"sections.adaptive-gallery">
}) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [showAll, setShowAll] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [hasDragged, setHasDragged] = useState(false)

  const desktopCols = parseInt(
    (component.desktopColumns || "3").split(" ")[0] || "3"
  )
  const mobileCols = parseInt(
    (component.mobileColumns || "2").split(" ")[0] || "2"
  )
  const isMobileSlider = (component.mobileLayout || "").startsWith("slider")
  const isDesktopSlider = (component.desktopLayout || "").startsWith("slider")
  const isAutoAspect = (component.imageAspectRatio || "").startsWith("auto")

  const IMAGES_LIMIT = 12
  const allImages = component.images || []
  const displayedImages = showAll ? allImages : allImages.slice(0, IMAGES_LIMIT)
  const hasMore = allImages.length > IMAGES_LIMIT

  const getContainerClass = () => {
    const aspectRatioValue =
      (component.imageAspectRatio || "").split(" ")[0] || "auto"
    const aspectRatioMap = {
      square: "md:aspect-square",
      portrait: "md:aspect-[3/4]",
      landscape: "md:aspect-[4/3]",
      auto: "",
    } as const
    const aspectRatio =
      aspectRatioMap[aspectRatioValue as keyof typeof aspectRatioMap] || ""

    if (isAutoAspect) {
      return "overflow-hidden"
    }

    return `relative overflow-hidden ${aspectRatio} flex items-center justify-center`.trim()
  }

  const getImageProps = () => ({
    className: isAutoAspect
      ? "w-full rounded-lg object-contain"
      : "w-full h-full rounded-lg object-cover object-center",
    fill: false,
  })

  const getGapClass = () => {
    const gapMap = {
      1: "gap-1",
      2: "gap-2",
      3: "gap-3",
      4: "gap-4",
      6: "gap-6",
      8: "gap-8",
    }
    const gap = parseInt((component.gap || "4").split(" ")[0] || "4")
    return gapMap[gap as keyof typeof gapMap] || "gap-4"
  }

  const getDesktopGridClass = () => {
    const colsMap = {
      1: "grid-cols-1",
      2: "grid-cols-2",
      3: "grid-cols-3",
      4: "grid-cols-4",
      5: "grid-cols-5",
      6: "grid-cols-6",
    }
    return `grid ${colsMap[desktopCols as keyof typeof colsMap] || "grid-cols-3"} ${getGapClass()}`
  }

  const getMobileGridClass = () => {
    const colsMap = {
      1: "grid-cols-1",
      2: "grid-cols-2",
      3: "grid-cols-3",
    }
    return `grid ${colsMap[mobileCols as keyof typeof colsMap] || "grid-cols-2"} ${getGapClass()}`
  }

  const nextSlide = () => {
    if (component.images) {
      const maxSlide = isMobileSlider
        ? component.images.length - 1
        : component.images.length - desktopCols
      if (currentSlide < maxSlide) {
        setCurrentSlide(currentSlide + 1)
      }
    }
  }

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    setIsDragging(true)
    setHasDragged(false)
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
    setDragStart(clientX)
    setDragOffset(0)
  }

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return
    e.preventDefault()
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
    const offset = clientX - dragStart
    setDragOffset(offset)
    if (Math.abs(offset) > 5) {
      setHasDragged(true)
    }
  }

  const handleDragEnd = () => {
    if (!isDragging) return
    setIsDragging(false)

    const threshold = 50
    const maxSlide = isMobileSlider
      ? displayedImages.length - 1
      : displayedImages.length - desktopCols

    if (Math.abs(dragOffset) > threshold) {
      if (dragOffset > 0 && currentSlide > 0) {
        prevSlide()
      } else if (dragOffset < 0 && currentSlide < maxSlide) {
        nextSlide()
      }
    }
    setDragOffset(0)
  }

  const renderImageItem = (x: any, i: number, className: string = "") =>
    x.link ? (
      <StrapiLink component={x.link} className="block">
        <StrapiBasicImage
          component={x.image}
          className={className || "w-full rounded-lg object-contain"}
        />
      </StrapiLink>
    ) : (
      <button
        type="button"
        className="w-full cursor-pointer rounded-lg outline-none focus:ring-2 focus:ring-red-500/50"
        onClick={() => !hasDragged && setSelectedImage(i)}
      >
        <StrapiBasicImage
          component={x.image}
          className={`${className || "w-full rounded-lg object-contain"} transition-opacity hover:opacity-80`}
        />
      </button>
    )

  return (
    <section>
      <Container className="py-8">
        <div className="flex flex-col items-center">
          {(component.title || component.subTitle) && (
            <div className="mb-6 text-center md:mb-8">
              {component.title && (
                <h2 className="mb-4 text-2xl font-bold text-gray-900 md:text-4xl lg:text-5xl">
                  {component.title}
                </h2>
              )}
              {component.subTitle && (
                <p className="mx-auto max-w-2xl text-base text-gray-600 md:text-lg">
                  {component.subTitle}
                </p>
              )}
            </div>
          )}

          {/* Mobile Slider */}
          {isMobileSlider && (
            <div className="relative w-full md:hidden">
              <div className="mx-12 overflow-hidden rounded-lg">
                <div
                  className={`flex ${isDragging ? "" : "transition-transform duration-300 ease-in-out"}`}
                  style={{
                    transform: `translateX(${Math.max(Math.min(-currentSlide * 100 + (isDragging ? dragOffset / 3 : 0), 0), -(displayedImages.length - 1) * 100)}%)`,
                    cursor: isDragging ? "grabbing" : "grab",
                    userSelect: "none",
                  }}
                  role="slider"
                  tabIndex={0}
                  onMouseDown={handleDragStart}
                  onMouseMove={handleDragMove}
                  onMouseUp={handleDragEnd}
                  onMouseLeave={handleDragEnd}
                  onTouchStart={handleDragStart}
                  onTouchMove={handleDragMove}
                  onTouchEnd={handleDragEnd}
                  onDragStart={(e) => e.preventDefault()}
                >
                  {displayedImages.map((x, i) => (
                    <div
                      key={String(x.id) + i}
                      className="w-full flex-shrink-0 px-2"
                    >
                      {renderImageItem(x, i)}
                    </div>
                  ))}
                </div>
              </div>

              {displayedImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevSlide}
                    disabled={currentSlide === 0}
                    className="absolute top-1/2 left-0 -translate-y-1/2 cursor-pointer rounded-full bg-black/70 p-2 text-white transition-all duration-200 hover:scale-110 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:scale-100 sm:p-3"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft size={20} className="sm:h-6 sm:w-6" />
                  </button>
                  <button
                    type="button"
                    onClick={nextSlide}
                    disabled={currentSlide === displayedImages.length - 1}
                    className="absolute top-1/2 right-0 -translate-y-1/2 cursor-pointer rounded-full bg-black/70 p-2 text-white transition-all duration-200 hover:scale-110 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:scale-100 sm:p-3"
                    aria-label="Next slide"
                  >
                    <ChevronRight size={20} className="sm:h-6 sm:w-6" />
                  </button>

                  <div className="mt-4 flex justify-center gap-2">
                    {displayedImages.map((_, index) => (
                      <button
                        type="button"
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`h-2 w-2 rounded-full transition-colors ${
                          index === currentSlide ? "bg-red-500" : "bg-gray-300"
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Mobile Grid */}
          {!isMobileSlider && (
            <div className="w-full md:hidden">
              <div className={getMobileGridClass()}>
                {displayedImages.map((x, i) => (
                  <div key={String(x.id) + i} className={getContainerClass()}>
                    {renderImageItem(x, i, getImageProps().className)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Desktop Slider */}
          {isDesktopSlider && (
            <div className="relative hidden w-full md:block">
              <div className="mx-16 overflow-hidden rounded-lg">
                <div
                  className={`flex ${isDragging ? "" : "transition-transform duration-300 ease-in-out"}`}
                  style={{
                    transform: `translateX(${Math.max(Math.min(-currentSlide * (100 / desktopCols) + (isDragging ? dragOffset / desktopCols / 3 : 0), 0), -(displayedImages.length - desktopCols) * (100 / desktopCols))}%)`,
                    cursor: isDragging ? "grabbing" : "grab",
                    userSelect: "none",
                  }}
                  role="slider"
                  tabIndex={0}
                  onMouseDown={handleDragStart}
                  onMouseMove={handleDragMove}
                  onMouseUp={handleDragEnd}
                  onMouseLeave={handleDragEnd}
                  onTouchStart={handleDragStart}
                  onTouchMove={handleDragMove}
                  onTouchEnd={handleDragEnd}
                  onDragStart={(e) => e.preventDefault()}
                >
                  {displayedImages.map((x, i) => (
                    <div
                      key={String(x.id) + i}
                      className={`flex-shrink-0 px-2`}
                      style={{ width: `${100 / desktopCols}%` }}
                    >
                      <div className={getContainerClass()}>
                        {renderImageItem(x, i, getImageProps().className)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {displayedImages.length > desktopCols && (
                <>
                  <button
                    type="button"
                    onClick={prevSlide}
                    disabled={currentSlide === 0}
                    className="absolute top-1/2 left-0 -translate-y-1/2 cursor-pointer rounded-full bg-black/70 p-2 text-white transition-all duration-200 hover:scale-110 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:scale-100 sm:p-3"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft size={20} className="sm:h-6 sm:w-6" />
                  </button>
                  <button
                    type="button"
                    onClick={nextSlide}
                    disabled={
                      currentSlide >= displayedImages.length - desktopCols
                    }
                    className="absolute top-1/2 right-0 -translate-y-1/2 cursor-pointer rounded-full bg-black/70 p-2 text-white transition-all duration-200 hover:scale-110 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:scale-100 sm:p-3"
                    aria-label="Next slide"
                  >
                    <ChevronRight size={20} className="sm:h-6 sm:w-6" />
                  </button>
                </>
              )}
            </div>
          )}

          {/* Desktop Grid */}
          {!isDesktopSlider && (
            <div className="hidden w-full md:block">
              <div className={getDesktopGridClass()}>
                {displayedImages.map((x, i) => (
                  <div key={String(x.id) + i} className={getContainerClass()}>
                    {x.link ? (
                      <StrapiLink component={x.link} className="block">
                        <StrapiBasicImage
                          component={x.image}
                          {...getImageProps()}
                        />
                      </StrapiLink>
                    ) : (
                      <button
                        type="button"
                        className="w-full cursor-pointer rounded-lg outline-none focus:ring-2 focus:ring-red-500/50"
                        onClick={() => !hasDragged && setSelectedImage(i)}
                      >
                        <StrapiBasicImage
                          component={x.image}
                          {...getImageProps()}
                          className={`${getImageProps().className} transition-opacity hover:opacity-80`}
                        />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Load More Button */}
          {hasMore && !showAll && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="mt-6 rounded-lg bg-red-500 px-6 py-2 text-white transition-colors hover:bg-red-600"
            >
              Load More ({allImages.length - IMAGES_LIMIT} more)
            </button>
          )}
        </div>
      </Container>

      {allImages.length > 0 && (
        <ImageGallery
          images={allImages}
          selectedImage={selectedImage}
          onClose={() => setSelectedImage(null)}
          onSelectImage={setSelectedImage}
        />
      )}
    </section>
  )
}

StrapiAdaptiveGallery.displayName = "StrapiAdaptiveGallery"

export default StrapiAdaptiveGallery
