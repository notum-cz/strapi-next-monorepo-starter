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

/**
 * Renders Strapi media from a `utilities.basic-image` component.
 *
 * Use this for CMS-managed images only. Use `StaticImage` for frontend-owned
 * assets from static imports or the public folder.
 *
 * Sizing follows `next/image`:
 * - pass `width`/`height` for fixed-ratio images; if one is missing, the other
 *   is derived from Strapi media metadata when possible.
 * - pass `fill` plus a positioned parent for cover/background-like images.
 * - pass `sizes` whenever a `fill` image is narrower than `100vw` at any
 *   breakpoint, so the browser chooses the right responsive candidate.
 * - use Tailwind classes for visual sizing (`h-10 w-auto`, `size-10`,
 *   `object-cover`, `object-contain`); `width`/`height` props are layout and
 *   optimizer hints, not a replacement for CSS sizing.
 *
 * Configuration:
 * - with `IMGPROXY_URL`, raster Strapi images use the imgproxy loader.
 * - without `IMGPROXY_URL`, images load directly from Strapi with
 *   `unoptimized` to avoid Next.js processing CMS image traffic.
 * - SVGs bypass imgproxy because they do not need raster resizing.
 */
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
