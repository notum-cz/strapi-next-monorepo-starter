/* eslint-disable jsx-a11y/alt-text */
"use client"

import React, { SyntheticEvent, useEffect, useState } from "react"

import { ImageExtendedProps } from "@/types/next"

import { FALLBACK_IMAGE_PATH } from "@/lib/constants"
import { formatImageUrl } from "@/lib/strapi-helpers"

import { ImageWithBlur } from "./ImageWithBlur"

export const ImageWithFallback = ({
  fallbackSrc,
  src: originalSrc,
  ...imgProps
}: ImageExtendedProps) => {
  const [src, setSrc] = useState(
    formatImageUrl(originalSrc ?? fallbackSrc ?? "")
  )

  useEffect(() => {
    setSrc(formatImageUrl(originalSrc ?? fallbackSrc ?? ""))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originalSrc])

  const handleLoadError = (e: SyntheticEvent<HTMLImageElement, Event>) => {
    if (src === fallbackSrc) {
      // fallback image load error
      setSrc(FALLBACK_IMAGE_PATH)
    } else if (fallbackSrc) {
      // original image load error
      setSrc(formatImageUrl(fallbackSrc))
    }

    imgProps?.onError?.(e)
  }

  return <ImageWithBlur src={src} {...imgProps} onError={handleLoadError} />
}
