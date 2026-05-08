"use client"

import Image, { type ImageProps } from "next/image"

import { imgproxyLoader } from "@/lib/imgproxy"

/**
 * Client component wrapper that passes the imgproxy loader to next/image.
 * Used by StrapiBasicImage when imgproxy is enabled.
 */
export function ImgproxyImage({ alt, ...props }: ImageProps & { alt: string }) {
  return (
    <Image alt={alt} {...props} loader={imgproxyLoader} unoptimized={false} />
  )
}
