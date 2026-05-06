/* eslint-disable jsx-a11y/alt-text */
"use client"

import Image from "next/image"
import { type SyntheticEvent, useState } from "react"

import { FALLBACK_IMAGE_PATH } from "@/lib/constants"
import type { ImageExtendedProps } from "@/types/next"

import { ImageWithBlur } from "./ImageWithBlur"

export function ImageWithFallback({
  fallbackSrc,
  src: originalSrc,
  blurOff,
  ...imgProps
}: ImageExtendedProps & { blurOff?: boolean }) {
  const [hasLoadError, setHasLoadError] = useState(false)
  const src = hasLoadError
    ? (fallbackSrc ?? FALLBACK_IMAGE_PATH)
    : (originalSrc ?? fallbackSrc ?? FALLBACK_IMAGE_PATH)

  const handleLoadError = (e: SyntheticEvent<HTMLImageElement, Event>) => {
    console.error(`Error loading image from ${src}:`, e)
    setHasLoadError(true)
    imgProps.onError?.(e)
  }

  if (blurOff) {
    return <Image src={src} {...imgProps} onError={handleLoadError} />
  }

  return <ImageWithBlur src={src} {...imgProps} onError={handleLoadError} />
}
