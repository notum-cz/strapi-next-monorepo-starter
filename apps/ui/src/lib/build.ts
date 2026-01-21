import { env } from "@/env.mjs"

export const DEBUG_STATIC_PARAMS_GENERATION = env.DEBUG_STATIC_PARAMS_GENERATION

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

  if (DEBUG_STATIC_PARAMS_GENERATION) {
    console.log(`generateStaticParams output <${segment}>`)
    if (isDevelopment === true) {
      console.log(" L (skipped in development mode)")
    } else {
      console.dir(staticParams, { depth: null, maxArrayLength: null })
    }
  }
}
