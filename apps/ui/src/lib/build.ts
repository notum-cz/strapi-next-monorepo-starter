import { Locale } from "next-intl"

import { getEnvVar } from "@/lib/env-vars"

/**
 * Logs the output of generateStaticParams when the debug flag is enabled
 * @param staticParams array of dynamic segments from generate static params
 * @param segment optional segment name to add clarity
 */
export const debugStaticParams = (
  staticParams: Array<unknown>,
  segment?: string,
  config?: { isDevelopment?: boolean }
) => {
  const { isDevelopment } = config ?? {}

  if (getEnvVar("DEBUG_STATIC_PARAMS_GENERATION")) {
    console.log(`generateStaticParams output <${segment}>`)
    if (isDevelopment === true) {
      console.log(" L (skipped in development mode)")
    } else {
      console.dir(staticParams, { depth: null, maxArrayLength: null })
    }
  }
}

/**
 * Returning an empty array from generateStaticParams in {output: 'export'} mode yields a build error. Therefore
 * we need to return at least a dummy value, even if it will result in a 404.
 *
 * @param params object containing parameter names and their fallback values
 * @returns object containing default locale and fallback values for each parameter
 * @example createFallbackPath("en", { slug: 'fallback' }) => {locale: "en", slug: "fallback"}
 * @example createFallbackPath("en", { slug: 'fallback', page: 'fallback' }) => {locale: "en", slug: "fallback", page: "fallback"}
 * @example createFallbackPath("en", { rest: ['fallback'] }) => {locale: "en", rest: ["fallback"]}
 */
export const createFallbackPath = (
  locale: Locale,
  params: Record<string, string | string[]>
) => ({
  locale,
  rest: [], // to satisfy type checking for [[...rest]], but can be overridden via `params`
  ...params,
})
