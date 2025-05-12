import React from "react"
import { env } from "@/env.mjs"

import { hashStringSHA256 } from "@/lib/crypto"

import StrapiPreviewWindowChangeListener from "./StrapiPreviewListener"

const STRAPI_PREVIEW_ENABLED = Boolean(env.STRAPI_PREVIEW_SECRET)

const StrapiPreviewListener = async () => {
  const strapiPreviewHashedOrigin = STRAPI_PREVIEW_ENABLED
    ? await hashStringSHA256(env.STRAPI_URL)
    : undefined

  if (!STRAPI_PREVIEW_ENABLED || !strapiPreviewHashedOrigin) {
    return null
  }

  return (
    <StrapiPreviewWindowChangeListener
      hashedAllowedReloadOrigin={strapiPreviewHashedOrigin}
    />
  )
}

export default StrapiPreviewListener
