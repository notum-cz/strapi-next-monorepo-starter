import type { Data } from "@repo/strapi-types"
import Image from "next/image"

import { ImageWithFallback } from "@/components/elementary/ImageWithFallback"
import { formatStrapiMediaUrl } from "@/lib/strapi-helpers"
import type { StrapiImageMedia } from "@/types/api"
import type { ImageExtendedProps } from "@/types/next"

export interface BasicImageProps extends Omit<
  ImageExtendedProps,
  "src" | "alt"
> {
  readonly component: Data.Component<"utilities.basic-image"> | undefined | null
  readonly useNativeNextImageOnly?: boolean
  readonly className?: ImageExtendedProps["className"]
  readonly hideWhenMissing?: boolean
  readonly fallbackSizes?: { width?: number | null; height?: number | null }
  readonly forcedSizes?: { width?: number | null; height?: number | null }
  readonly format?: "large" | "small" | "medium" | "thumbnail"
}

export function StrapiBasicImage({
  component,
  className,
  hideWhenMissing,
  fallbackSizes,
  forcedSizes,
  format,
  useNativeNextImageOnly,
  ...imgProps
}: BasicImageProps) {
  const media: StrapiImageMedia = component?.media
  const selectedFormat = format ? media?.formats?.[format] : undefined

  const url = selectedFormat?.url ?? media?.url

  if (url == null && hideWhenMissing) {
    return null
  }

  const ImageComp = useNativeNextImageOnly ? Image : ImageWithFallback

  const sizes = {
    width:
      forcedSizes?.width ??
      component?.width ??
      selectedFormat?.width ??
      media?.width ??
      fallbackSizes?.width ??
      undefined,

    height:
      forcedSizes?.height ??
      component?.height ??
      selectedFormat?.height ??
      media?.height ??
      fallbackSizes?.height ??
      undefined,
  }

  const src = formatStrapiMediaUrl(url)
  const fallbackSrc = formatStrapiMediaUrl(component?.fallbackSrc)

  if (imgProps.fill) {
    // Fill has priority over sizes
    sizes.width = undefined
    sizes.height = undefined
  }

  if (!imgProps.fill && (!sizes.width || !sizes.height)) {
    // If width or height is missing, fill the image
    // This happens mostly if there is no media in Strapi and
    // we are using a fallback image
    imgProps.fill = true
    sizes.width = undefined
    sizes.height = undefined
  }

  return (
    <ImageComp
      style={{ ...sizes, ...imgProps.style }}
      className={className}
      src={src}
      fallbackSrc={fallbackSrc}
      alt={component?.alt ?? media?.caption ?? media?.alternativeText ?? ""}
      {...sizes}
      {...imgProps}
    />
  )
}

StrapiBasicImage.displayName = "StrapiBasicImage"
