import type { Data } from "@repo/strapi-types"
import type { MetadataRoute } from "next"

function splitPaths(value: string | null | undefined) {
  const paths = value
    ?.split(/\r?\n/)
    .map((path) => path.trim())
    .filter(Boolean)

  return paths?.length ? paths : undefined
}

export function getRobotsRules(
  configuration:
    | Data.Component<"seo-utilities.robots-configuration">
    | null
    | undefined
): MetadataRoute.Robots["rules"] {
  if (!configuration?.rules?.length) {
    return [{ userAgent: "*", allow: "/" }]
  }

  return configuration.rules.map((rule) => ({
    userAgent: rule.userAgent?.trim() || "*",
    allow: splitPaths(rule.allowPaths),
    disallow: splitPaths(rule.disallowPaths),
  }))
}
