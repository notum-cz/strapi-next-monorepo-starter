import { Schema } from "@repo/strapi"

import { StrapiImageMedia } from "@/types/api"
import { ImageExtendedProps } from "@/types/next"

import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"
import { ImageWithFallback } from "@/components/elementary/ImageWithFallback"
import { ImageWithPlaiceholder } from "@/components/elementary/ImageWithPlaiceholder"

export interface BasicImageProps
  extends Omit<ImageExtendedProps, "src" | "alt"> {
  readonly component:
    | Schema.Attribute.ComponentValue<"shared.basic-image", false>
    | undefined
    | null
  readonly useClient?: boolean
  readonly className?: ImageExtendedProps["className"]
  readonly hideWhenMissing?: boolean
  readonly fallbackSizes?: { width?: number | null; height?: number | null }
  readonly forcedSizes?: { width?: number | null; height?: number | null }
}

export function BasicImage({
  component,
  useClient,
  className,
  hideWhenMissing,
  fallbackSizes,
  forcedSizes,
  ...imgProps
}: BasicImageProps) {
  removeThisWhenYouNeedMe("BasicImage")

  const media: StrapiImageMedia = component?.media

  if (media?.url == null && hideWhenMissing) {
    return null
  }

  const ImageComp = useClient ? ImageWithFallback : ImageWithPlaiceholder

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
