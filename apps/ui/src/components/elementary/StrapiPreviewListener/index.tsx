import { hashStringSHA256 } from "@/lib/crypto"
import { getEnvVar } from "@/lib/env-vars"

import StrapiPreviewWindowChangeListener from "./StrapiPreviewListener"

function StrapiPreviewListener() {
  const strapiUrl = getEnvVar("STRAPI_URL")

  if (!strapiUrl) {
    return null
  }

  const previewSecret = Boolean(getEnvVar("STRAPI_PREVIEW_SECRET"))
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
