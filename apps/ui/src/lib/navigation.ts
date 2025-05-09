import { env } from "@/env.mjs"
import { createNavigation } from "next-intl/navigation"
import { defineRouting } from "next-intl/routing"

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

export const getAppPublicUrl = () => {
  // Determine the base URL: use APP_PUBLIC_URL on the server or window.location.origin on the client
  const baseUrl =
    typeof window === "undefined" ? env.APP_PUBLIC_URL : window.location.origin
  return baseUrl
}

export const isAppLink = (link: string): boolean => {
  try {
    const baseUrl = getAppPublicUrl()
    if (!baseUrl) {
      throw new Error("Base URL is not defined.")
    }

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
