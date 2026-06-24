import type { MetadataRoute } from "next"

import { getEnvVar } from "@/lib/env-vars"
import { isProduction } from "@/lib/general-helpers"

// Evaluate at request time so APP_ENV (injected at runtime, not build time) is read.
export const dynamic = "force-dynamic"

export default function robots(): MetadataRoute.Robots {
  if (!isProduction()) {
    return { rules: { userAgent: "*", disallow: "/" } }
  }

  const baseUrl = getEnvVar("APP_PUBLIC_URL")
  if (!baseUrl) {
    return { rules: { userAgent: "*", allow: "/" } }
  }

  const sitemapUrl = new URL("./sitemap.xml", baseUrl)

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: sitemapUrl.href,
  }
}
