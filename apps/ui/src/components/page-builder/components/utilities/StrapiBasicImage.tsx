import type { StrapiImageMedia } from "@/types/api"
import type { ImageExtendedProps } from "@/types/next"
import type { Data } from "@repo/strapi"

import { ImageWithFallback } from "@/components/elementary/ImageWithFallback"

export interface BasicImageProps
  extends Omit<ImageExtendedProps, "src" | "alt"> {
  readonly component: Data.Component<"utilities.basic-image"> | undefined | null
  readonly useClient?: boolean
  readonly className?: ImageExtendedProps["className"]
  readonly hideWhenMissing?: boolean
  readonly fallbackSizes?: { width?: number | null; height?: number | null }
  readonly forcedSizes?: { width?: number | null; height?: number | null }
}

export function StrapiBasicImage({
  component,
  useClient,
  className,
  hideWhenMissing,
  fallbackSizes,
  forcedSizes,
  ...imgProps
}: BasicImageProps) {
  const media: StrapiImageMedia = component?.media

  if (media?.url == null && hideWhenMissing) {
    return null
  }

  // TODO: fix basic image to in client components
  // const ImageComp = useClient ? ImageWithFallback : ImageWithPlaiceholder
  const ImageComp = ImageWithFallback

  const sizes = {
    width:
      forcedSizes?.width ??
      component?.width ??
      media?.width ??
      fallbackSizes?.width ??
      undefined,

    height:
      forcedSizes?.height ??
      component?.height ??
      media?.height ??
      fallbackSizes?.height ??
      undefined,
  }

  return (
    <ImageComp
      style={{ ...sizes, ...imgProps.style }}
      className={className}
      // @ts-expect-error - src needs to be typed in better way
      src={media?.url}
      fallbackSrc={component?.fallbackSrc ?? undefined}
      alt={component?.alt ?? media?.caption ?? media?.alternativeText ?? ""}
      {...sizes}
      {...imgProps}
    />
  )
}

StrapiBasicImage.displayName = "StrapiBasicImage"
