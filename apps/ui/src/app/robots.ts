import { env } from "@/env.mjs"

import type { MetadataRoute } from "next"

import { isProduction } from "@/lib/general-helpers"

const baseUrl = env.APP_PUBLIC_URL

export default function robots(): MetadataRoute.Robots {
  return isProduction()
    ? {
        rules: [
          {
            userAgent: "*",
            allow: "/",
            disallow: ["/admin", "/account"],
          },
          {
            userAgent: [
              "UbiCrawler",
              "DOC",
              "Zao",
              "sitecheck.internetseer.com",
              "Zealbot",
              "MSIECrawler",
              "SiteSnagger",
              "WebStripper",
              "WebCopier",
              "Fetch",
              "Offline Explorer",
              "Teleport",
              "TeleportPro",
              "WebZIP",
              "linko",
              "HTTrack",
              "Microsoft.URL.Control",
              "Xenu",
              "larbin",
              "libwww",
              "ZyBORG",
              "Download Ninja",
              "fast",
              "Maxthon",
              "CNCDialer",
              "MJ12bot",
            ],
            disallow: "/",
          },
        ],
        sitemap: new URL("sitemap.xml", baseUrl).toString(),
      }
    : {
        rules: {
          userAgent: "*",
          disallow: "/",
        },
      }
}
