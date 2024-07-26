import React from "react"
import { Attribute } from "@repo/strapi"

import { StrapiDataWrapper, StrapiImageMedia } from "@/types/api"
import { ImageExtendedProps } from "@/types/next"

import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"
import { ImageWithFallback } from "@/components/elementary/ImageWithFallback"
import { ImageWithPlaiceholder } from "@/components/elementary/ImageWithPlaiceholder"

export interface BasicImageProps
  extends Omit<ImageExtendedProps, "src" | "alt"> {
  readonly component:
    | Attribute.ComponentValue<"shared.basic-image", false>
    | undefined
  readonly useClient?: boolean
  readonly className?: ImageExtendedProps["className"]
  readonly hideWhenMissing?: boolean
  readonly fallbackSizes?: { width?: number; height?: number }
  readonly forcedSizes?: { width?: number; height?: number }
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

  const media: StrapiDataWrapper<StrapiImageMedia> = component?.media

  if (media?.data?.attributes?.url == null && hideWhenMissing) {
    return null
  }

  const ImageComp = useClient ? ImageWithFallback : ImageWithPlaiceholder

  const sizes = {
    width:
      forcedSizes?.width ??
      component?.width ??
      media?.data?.attributes?.width ??
      fallbackSizes?.width,

    height:
      forcedSizes?.height ??
      component?.height ??
      media?.data?.attributes?.height ??
      fallbackSizes?.height,
  }

  const attributes = media?.data?.attributes

  return (
    <ImageComp
      style={{ ...sizes, ...imgProps.style }}
      className={className}
      // @ts-expect-error - src needs to be typed in better way
      src={attributes?.url}
      fallbackSrc={component?.fallbackSrc}
      alt={
        component?.alt ??
        attributes?.caption ??
        attributes?.alternativeText ??
        ""
      }
      {...sizes}
      {...imgProps}
    />
  )
}
