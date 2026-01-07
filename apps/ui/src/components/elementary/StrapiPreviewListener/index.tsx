import { env } from "@/env.mjs"

import { hashStringSHA256 } from "@/lib/crypto"
import { getStrapiUrl } from "@/lib/urls"

import StrapiPreviewWindowChangeListener from "./StrapiPreviewListener"

const StrapiPreviewListener = async () => {
  const strapiUrl = getStrapiUrl()

  if (!strapiUrl) {
    return null
  }

  const previewSecret = Boolean(env.STRAPI_PREVIEW_SECRET)
  const strapiPreviewHashedOrigin = previewSecret
    ? await hashStringSHA256(strapiUrl)
    : undefined

  if (!previewSecret || !strapiPreviewHashedOrigin) {
    return null
  }

  return (
    <StrapiPreviewWindowChangeListener
      hashedAllowedReloadOrigin={strapiPreviewHashedOrigin}
    />
  )
}

export default StrapiPreviewListener
