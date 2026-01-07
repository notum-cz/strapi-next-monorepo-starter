import type { MetadataRoute } from "next"

import { isProduction } from "@/lib/general-helpers"
import { getAppPublicUrl } from "@/lib/urls"

export const dynamic = "force-dynamic"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getAppPublicUrl(true)

  return isProduction()
    ? {
        rules: {
          userAgent: "*",
          allow: "/",
        },
        sitemap: new URL("sitemap.xml", baseUrl).toString(),
      }
    : {
        rules: {
          userAgent: "*",
          disallow: "/",
        },
      }
}
