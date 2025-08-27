"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

import { formatStrapiMediaUrl } from "@/lib/strapi-helpers"

interface ImageGalleryProps {
  images: any[]
  selectedImage: number | null
  onClose: () => void
  onSelectImage: (index: number) => void
}

export function ImageGallery({
  images,
  selectedImage,
  onClose,
  onSelectImage,
}: ImageGalleryProps) {
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 })

  const isOpen = selectedImage !== null && images[selectedImage]

  const nextImage = () => {
    if (selectedImage < images.length - 1) {
      onSelectImage(selectedImage + 1)
      setIsZoomed(false)
      setZoomOrigin({ x: 50, y: 50 })
    }
  }

  const prevImage = () => {
    if (selectedImage > 0) {
      onSelectImage(selectedImage - 1)
      setIsZoomed(false)
      setZoomOrigin({ x: 50, y: 50 })
    }
  }

  const toggleZoom = (e: React.MouseEvent<HTMLImageElement>) => {
    e.stopPropagation()

    if (!isZoomed) {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      setZoomOrigin({ x, y })
    }

    setIsZoomed(!isZoomed)
  }

  useEffect(() => {
    if (!isOpen) return

    // Prevent body scroll when gallery is open
    document.body.style.overflow = "hidden"

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose()
          break
        case "ArrowRight":
        case " ":
          e.preventDefault()
          if (selectedImage !== null && selectedImage < images.length - 1) {
            onSelectImage(selectedImage + 1)
            setIsZoomed(false)
            setZoomOrigin({ x: 50, y: 50 })
          }
          break
        case "ArrowLeft":
          e.preventDefault()
          if (selectedImage !== null && selectedImage > 0) {
            onSelectImage(selectedImage - 1)
            setIsZoomed(false)
            setZoomOrigin({ x: 50, y: 50 })
          }
          break
        case "Home":
          e.preventDefault()
          onSelectImage(0)
          setIsZoomed(false)
          setZoomOrigin({ x: 50, y: 50 })
          break
        case "End":
          e.preventDefault()
          onSelectImage(images.length - 1)
          setIsZoomed(false)
          setZoomOrigin({ x: 50, y: 50 })
          break
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      // Restore body scroll when gallery closes
      document.body.style.overflow = "unset"
    }
  }, [isOpen, selectedImage, images.length, onClose, onSelectImage])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-2 sm:p-4">
      <div
        className="absolute inset-0 cursor-pointer transition-colors hover:bg-black/5"
        onClick={onClose}
        aria-label="Close gallery"
      />

      <div className="relative flex h-full max-h-[95vh] w-full max-w-6xl items-center justify-center sm:max-h-[90vh]">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 z-10 cursor-pointer rounded-full bg-black/50 p-2 text-white transition-all duration-200 hover:scale-110 hover:bg-red-600/80 hover:shadow-lg sm:top-4 sm:right-4 sm:p-2"
          aria-label="Close gallery"
        >
          <X size={18} className="sm:h-5 sm:w-5" />
        </button>

        {/* Navigation arrows */}
        {selectedImage > 0 && (
          <button
            type="button"
            onClick={prevImage}
            className="absolute top-1/2 left-2 z-10 -translate-y-1/2 cursor-pointer rounded-full bg-black/50 p-2 text-white transition-all duration-200 hover:scale-110 hover:bg-red-600/80 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:scale-100 disabled:hover:bg-black/50 sm:left-4 sm:p-3"
            aria-label="Previous image"
          >
            <ChevronLeft size={20} className="sm:h-6 sm:w-6" />
          </button>
        )}

        {selectedImage < images.length - 1 && (
          <button
            type="button"
            onClick={nextImage}
            className="absolute top-1/2 right-2 z-10 -translate-y-1/2 cursor-pointer rounded-full bg-black/50 p-2 text-white transition-all duration-200 hover:scale-110 hover:bg-red-600/80 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:scale-100 disabled:hover:bg-black/50 sm:right-4 sm:p-3"
            aria-label="Next image"
          >
            <ChevronRight size={20} className="sm:h-6 sm:w-6" />
          </button>
        )}

        {/* Main image */}
        <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
          <img
            src={formatStrapiMediaUrl(images[selectedImage].image!.media!.url!)}
            alt={images[selectedImage].image!.alt! || ""}
            onClick={toggleZoom}
            style={{
              transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
              transition:
                "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.3s ease",
            }}
            className={`hover:shadow-3xl rounded-lg shadow-2xl transition-transform duration-500 ease-out outline-none focus:ring-2 focus:ring-red-500/50 ${
              isZoomed
                ? "scale-200 cursor-zoom-out"
                : "max-h-full max-w-full cursor-zoom-in object-contain"
            }`}
          />
        </div>

        {/* Dots navigation */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 flex max-w-[90vw] -translate-x-1/2 gap-2 overflow-x-auto rounded-full bg-black/50 px-3 py-2 transition-colors hover:bg-black/60 sm:bottom-6 sm:gap-3 sm:px-4">
            {images.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onSelectImage(index)
                }}
                className={`h-2 w-2 flex-shrink-0 cursor-pointer rounded-full transition-all duration-200 hover:scale-125 hover:shadow-lg sm:h-3 sm:w-3 ${
                  index === selectedImage
                    ? "scale-110 bg-white shadow-lg"
                    : "bg-white/40 hover:bg-white/80"
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Image counter */}
        <div className="absolute top-2 left-2 cursor-default rounded-full bg-black/50 px-2 py-1 text-xs text-white transition-colors select-none hover:bg-black/60 sm:top-4 sm:left-4 sm:px-3 sm:text-sm">
          {selectedImage + 1} / {images.length}
        </div>
      </div>
    </div>
  )
}
