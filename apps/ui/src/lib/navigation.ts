import { Data } from "@repo/strapi-types"
import { createNavigation } from "next-intl/navigation"
import { defineRouting } from "next-intl/routing"

import { getEnvVar } from "@/lib/env-vars"

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ["cs", "en"],

  // Used when no locale matches
  defaultLocale: "en",

  localePrefix: "as-needed",
})

// https://next-intl-docs.vercel.app/docs/routing/navigation
export const {
  Link,
  redirect: _redirect,
  usePathname,
  useRouter,
} = createNavigation(routing)

// Help TypeScript detect unreachable code
// https://next-intl-docs.vercel.app/docs/routing/navigation#redirect
export const redirect: typeof _redirect = _redirect

/**
 * Function to check if a given link belongs to the same application - it is internal link.
 *
 * @param link
 * @returns true if the link is internal, false otherwise
 */
export const isAppLink = (link: string): boolean => {
  try {
    const baseUrl = getEnvVar("APP_PUBLIC_URL", true) as string
    const url = new URL(link, baseUrl)
    return url.hostname === new URL(baseUrl).hostname
  } catch (error) {
    return false
  }
}

export const formatHref = (href: string | undefined | null): string => {
  if (!href || href === "#") {
    // Empty path -> return hash to prevent unwanted issues
    return "#"
  }

  if (href.startsWith("http")) {
    // External or internal link that starts with http(s) -> return as is
    return href
  }

  if (!isAppLink(href)) {
    // External link -> return as is
    return href
  }

  if (!href.startsWith("/")) {
    // Ensure path starts with a slash
    href = `/${href}`
  }

  return href
}

export const getStrapiLinkHref = (
  component?: Data.Component<"utilities.link"> | null
) => {
  // Add more when needed
  switch (component?.type) {
    case "external":
      return component.href
    case "page":
      return component.page?.fullPath ?? "#"
    default:
      return undefined
  }
}
