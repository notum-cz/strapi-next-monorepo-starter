"use client"

import { X } from "lucide-react"
import { formatStrapiMediaUrl } from "@/lib/strapi-helpers"

interface ImageGalleryProps {
  images: any[]
  selectedImage: number | null
  onClose: () => void
  onSelectImage: (index: number) => void
}

export function ImageGallery({ images, selectedImage, onClose, onSelectImage }: ImageGalleryProps) {
  if (selectedImage === null || !images[selectedImage]) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <button
        type="button"
        className="absolute inset-0 bg-transparent border-0"
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        aria-label="Close gallery"
      />
      <div className="relative max-h-[90vh] max-w-[90vw]">
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300"
        >
          <X size={24} />
        </button>
        <img
          src={formatStrapiMediaUrl(images[selectedImage].image!.media!.url!)}
          alt={images[selectedImage].image!.alt! || ''}
          className="max-h-full max-w-full object-contain"
        />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={(e) => { e.stopPropagation(); onSelectImage(index) }}
              className={`h-2 w-2 rounded-full ${
                index === selectedImage ? 'bg-white' : 'bg-white/50'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}