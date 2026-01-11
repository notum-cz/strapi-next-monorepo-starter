import type { MetadataRoute } from "next"

import { isProduction } from "@/lib/general-helpers"
import { getAppPublicUrl } from "@/lib/urls"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getAppPublicUrl()

  if (!isProduction()) {
    return { rules: { userAgent: "*", disallow: "/" } }
  }

  return {
    rules: { userAgent: "*", allow: "/" },
    ...(baseUrl ? { sitemap: new URL("sitemap.xml", baseUrl).toString() } : {}),
  }
}
