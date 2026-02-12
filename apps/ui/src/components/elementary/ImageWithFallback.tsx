"use client"

import Image from "next/image"
import { type SyntheticEvent, useEffect, useState } from "react"

import { FALLBACK_IMAGE_PATH } from "@/lib/constants"
import type { ImageExtendedProps } from "@/types/next"

import { ImageWithBlur } from "./ImageWithBlur"

const invalidSrc = "/invalid-src.jpg"

export function ImageWithFallback({
  fallbackSrc,
  src: originalSrc,
  blurOff,
  ...imgProps
}: ImageExtendedProps & { blurOff?: boolean }) {
  const [src, setSrc] = useState(originalSrc ?? fallbackSrc ?? invalidSrc)

  useEffect(() => {
    setSrc(originalSrc ?? fallbackSrc ?? invalidSrc)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originalSrc])

  const handleLoadError = (e: SyntheticEvent<HTMLImageElement, Event>) => {
    console.error(`Error loading image from ${src}:`, e)

    if (fallbackSrc) {
      setSrc(fallbackSrc)
    } else {
      setSrc(FALLBACK_IMAGE_PATH)
    }

    imgProps?.onError?.(e)
  }

  if (blurOff) {
    return <Image src={src} {...imgProps} onError={handleLoadError} />
  }

  return <ImageWithBlur src={src} {...imgProps} onError={handleLoadError} />
}
