/* eslint-disable no-console */
import { cookies, draftMode } from "next/headers"
import { env } from "@/env.mjs"

// import { ROOT_BLOG_PAGE_PATH, ROOT_PAGE_PATH } from "@/lib/constants" // TODO replace once @tocosastalo adds the page builder logic
import { redirect, routing } from "@/lib/navigation"

const ROOT_PAGE_PATH = "builder" // TODO: this is going after new page builder is merged by @tocosastalo

export async function GET(request: Request) {
  if (!env.STRAPI_PREVIEW_SECRET) {
    console.log(
      "[STRAPI_PREVIEW]: Preview request received, but [STRAPI_PREVIEW_SECRET] has not been configured. Status: 404."
    )
    return new Response("Invalid Configuration", { status: 404 })
  }
  const { searchParams } = new URL(request.url)
  // Check if the provided secret matches our secret key
  const secret = String(searchParams.get("secret"))
  if (secret !== env.STRAPI_PREVIEW_SECRET) {
    console.log(
      "[STRAPI_PREVIEW]: Preview request received, but [secret] does not match [STRAPI_PREVIEW_SECRET]. Status: 401."
    )
    return new Response("Invalid token", { status: 401 })
  }
  // Validate the URL begins with ROOT_PAGE_PATH (e.g. index, with optional / for nested pages)
  const urlParam = String(searchParams.get("url"))
  const url = urlParam.match(validPageUrlRegex)
    ? urlParam // urlParam.replace(validPageUrlReplaceWithEmptyRegex, "") TODO: this should be uncommented after the new page builder is merged by @tocosastalo
    : undefined
  if (!url) {
    return new Response("Invalid URL", { status: 404 })
  }

  // Check if the status in the request is configured correctly
  const statusParam = String(searchParams.get("status"))
  const status = validPageStatusKeys.includes(statusParam)
    ? statusParam
    : "published"
  const dm = await draftMode()
  if (status === "published") {
    dm.disable()
  } else {
    /**
     * This works by setting the `__prerender_bypass` response cookie, which is then used to display drafts
     * This has a shortcoming when working with iframe embeddings (such as Strapi preview), where the cookie is being set from a different origin
     * and therefore fails, so Strapi always displays the published version, because draftMode().isEnabled returns `false`
     */
    dm.enable()
  }
  // ------ This code is a workaround for the aforementioned issue ------
  const cookieStore = await cookies()
  const draftCookie = cookieStore.get(draftModePrerenderCookieKey)
  // If we have the cookie, update it with cross-origin iframe support
  // NOTE: You cannot use any other cookie method other than .set() (such as .delete()), because
  // they automatically assume the sameSite=Lax strategy, which will not work with iframes
  cookieStore.set({
    name: draftModePrerenderCookieKey,
    value: draftCookie?.value || "",
    expires: draftCookie?.value ? undefined : 0, // undefined => does not expire, 0 => expires at timestamp 0
    httpOnly: true,
    path: "/",
    secure: true,
    sameSite: "none", // Allow cookie in cross-origin iframes
  })
  // --------------------------------------------------------------------
  // Check if the locale in the request is a correct frontend locale
  const localeParam = String(searchParams.get("locale"))
  const locale = routing.locales.includes(localeParam as never)
    ? localeParam
    : routing.defaultLocale
  console.log(
    `[STRAPI_PREVIEW]: Preview request generated. ${JSON.stringify({
      locale,
      url: {
        urlParam,
        processedUrl: `/${url}`,
      },
      status,
    })}`
  )

  // cookieStore.set({
  //   name: "Content-Security-Policy",
  //   value: `
  //   frame-ancestors 'self' ${env.NEXT_PUBLIC_STRAPI_URL ? env.NEXT_PUBLIC_STRAPI_URL.replace(/127.0.0.1/, "localhost") : ""};
  //   upgrade-insecure-requests;
  //   `,
  //   expires: undefined, // undefined => does not expire, 0 => expires at timestamp 0
  //   httpOnly: true,
  //   path: "/",
  //   secure: true,
  //   sameSite: "none", // Allow cookie in cross-origin iframes
  // })

  // Redirect to the path from the fetched post
  redirect({ href: `/${url}`, locale })
}
/**
 * This is an interpolated regex that will match if the route begins with ROOT_PAGE_PATH
 * and optionally contains a forward slash "/"
 *
 * The following will match:    |   The following will NOT match
 * [index]                      |   testing
 * [index/]markets              |   testing/markets
 * [index/]trade/cfds           |   randomPath/trade/cfds
 */
const validPageUrlRegex = new RegExp(String.raw`(?:${ROOT_PAGE_PATH})\/?`, "g")
/**
 * Only in case of pages <api::page.page> we would like to remove the `index` prefix
 */
const validPageUrlReplaceWithEmptyRegex = new RegExp(
  String.raw`${ROOT_PAGE_PATH}\/?`,
  "g"
)
const validPageStatusKeys = ["draft", "published"]
const draftModePrerenderCookieKey = "__prerender_bypass"
