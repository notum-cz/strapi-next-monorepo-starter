import { StaticImport } from "next/dist/shared/lib/get-img-props"
import { env } from "@/env.mjs"

import { removeThisWhenYouNeedMe } from "./general-helpers"

// TODO: make this generic - return same type as argument has
export const formatImageUrl = (
  imageUrl: string | StaticImport | undefined | null
): any => {
  removeThisWhenYouNeedMe("formatImageUrl")

  if (!imageUrl) {
    return undefined
  }

  if (typeof imageUrl === "string") {
    if (!imageUrl.startsWith("http")) {
      return `${env.NEXT_PUBLIC_STRAPI_URL}${imageUrl}`
    }
  }

  if (typeof imageUrl === "object") {
    if ("default" in imageUrl && !imageUrl.default.src.startsWith("http")) {
      return {
        ...imageUrl,
        default: {
          ...imageUrl.default,
          src: `${env.NEXT_PUBLIC_STRAPI_URL}${imageUrl.default.src}`,
        },
      }
    }

    if ("src" in imageUrl && !imageUrl.src.startsWith("http")) {
      return {
        ...imageUrl,
        src: `${env.NEXT_PUBLIC_STRAPI_URL}${imageUrl.src}`,
      }
    }
  }

  return imageUrl
}
