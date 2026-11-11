import type { MetadataRoute } from "next"

import { getEnvVar } from "@/lib/env-vars"
import { isProduction } from "@/lib/general-helpers"
import { getRobotsRules } from "@/lib/metadata/robots"
import { fetchRobotsConfiguration } from "@/lib/strapi-api/content/server"

// Evaluate at request time so APP_ENV (injected at runtime, not build time) is read.
export const dynamic = "force-dynamic"

export default async function robots(): Promise<MetadataRoute.Robots> {
  // Non-production and Basic Auth override CMS rules before any fetch.
  if (!isProduction() || getEnvVar("BASIC_AUTH_ENABLED")) {
    return { rules: { userAgent: "*", disallow: "/" } }
  }

  const baseUrl = getEnvVar("APP_PUBLIC_URL")
  const configuration = await fetchRobotsConfiguration()
  const sitemapUrl = baseUrl ? new URL("/sitemap.xml", baseUrl) : undefined

  return {
    rules: getRobotsRules(configuration),
    sitemap: sitemapUrl?.href,
  }
}
