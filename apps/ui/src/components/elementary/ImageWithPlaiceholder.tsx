/* eslint-disable jsx-a11y/alt-text */

import Image from "next/image"
import { getPlaiceholder } from "plaiceholder"

import { ImageExtendedProps } from "@/types/next"

import { FALLBACK_IMAGE_PATH } from "@/lib/constants"
import { formatStrapiMediaUrl } from "@/lib/strapi-helpers"

const generatePlaceholder = async (src: string) => {
  try {
    const response = await fetch(src)
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    try {
      const {
        metadata: { height, width },
        ...plaiceholder
      } = await getPlaiceholder(buffer, { size: 10 })

      return {
        plaiceholder,
        img: { src, height, width },
      }
    } catch (e) {
      console.error(`Plaiceholder generation for image ${src} failed: `, e)
      return { plaiceholderError: true }
    }
  } catch (e) {
    console.error(`Image ${src} wasn't fetched: `, e)
    return null
  }
}

export const ImageWithPlaiceholder = async (props: ImageExtendedProps) => {
  const src = formatStrapiMediaUrl(props.src)
  const fallbackSrc = formatStrapiMediaUrl(props.fallbackSrc)

  const srcPlaceholder =
    src != null ? await generatePlaceholder(src) : undefined

  const fallbackSrcPlaceholder =
    srcPlaceholder == null && fallbackSrc != null
      ? await generatePlaceholder(fallbackSrc)
      : undefined

  const placeholder = srcPlaceholder ?? fallbackSrcPlaceholder

  // eslint-disable-next-line no-unused-vars
  const { fallbackSrc: fallback, ...imageProps } = props

  if (placeholder == null) {
    // Image and fallback image weren't loaded -> show local fallback image
    return (
      <Image {...imageProps} src={FALLBACK_IMAGE_PATH} width={50} height={50} />
    )
  }

  if (placeholder.plaiceholderError) {
    // Plaiceholder generation failed -> show image as it is
    return <Image {...imageProps} />
  }

  return (
    <Image
      placeholder="blur"
      blurDataURL={placeholder.plaiceholder!.base64}
      {...imageProps}
      {...placeholder.img}
    />
  )
}
