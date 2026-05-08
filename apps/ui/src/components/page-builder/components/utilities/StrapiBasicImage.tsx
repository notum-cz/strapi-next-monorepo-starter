import type { Data } from "@repo/strapi-types"
import Image from "next/image"

import { ImgproxyImage } from "@/components/elementary/images/ImgproxyImage"
import { isImgproxyEnabled } from "@/lib/imgproxy"
import { formatStrapiMediaUrl } from "@/lib/strapi-helpers"
import type { StrapiImageMedia } from "@/types/api"
import type { ImageExtendedProps } from "@/types/next"

export interface BasicImageProps extends Omit<
  ImageExtendedProps,
  "src" | "alt"
> {
  readonly component: Data.Component<"utilities.basic-image"> | undefined | null
  readonly className?: ImageExtendedProps["className"]
}

export function StrapiBasicImage({
  component,
  className,
  ...imgProps
}: BasicImageProps) {
  const {
    fill,
    height: propHeight,
    style,
    width: propWidth,
    ...restImgProps
  } = imgProps
  const media: StrapiImageMedia = component?.media

  const src = formatStrapiMediaUrl(media?.url ?? component?.fallbackSrc)

  if (src == null) {
    return null
  }

  const alt = component?.alt ?? media?.caption ?? media?.alternativeText ?? ""

  const requestedWidth = propWidth ?? component?.width
  const requestedHeight = propHeight ?? component?.height
  const ratio = media?.width && media?.height ? media.width / media.height : 0

  const width =
    requestedWidth ??
    (requestedHeight && ratio
      ? Math.round(Number(requestedHeight) * ratio)
      : media?.width)

  const height =
    requestedHeight ??
    (requestedWidth && ratio
      ? Math.round(Number(requestedWidth) / ratio)
      : media?.height)

  const useFill = fill || !width || !height
  const isSvg = media?.ext === ".svg"
  const useImgproxy = isImgproxyEnabled() && !isSvg

  const imageProps = {
    className,
    src,
    alt,
    ...restImgProps,
    ...(useFill ? { fill: true as const } : { width, height }),
    // Keep visual sizing in Tailwind classes by default.
    // If this component should own rendered dimensions again, uncomment this
    // and explicit width/height props will override global image CSS:
    // style: {
    //   ...(!useFill && requestedWidth ? { width: requestedWidth } : {}),
    //   ...(!useFill && requestedHeight ? { height: requestedHeight } : {}),
    //   ...style,
    // },
    style,
  }

  if (useImgproxy) {
    return <ImgproxyImage {...imageProps} />
  }

  return <Image {...imageProps} alt={alt} unoptimized />
}
