import { env } from "@/env.mjs"

import { setupDayJs } from "./dates"

export const isProduction = () => env.APP_ENV === "production"

export const isTesting = () => env.APP_ENV === "testing"

export const isDevelopment = () => env.NODE_ENV === "development"

export const setupLibraries = () => {
  setupDayJs()
}

export const getEnvVariableValue = (varName: string) =>
  // @ts-expect-error - accessing dynamic env variable
  typeof window === "undefined" ? env?.[varName] : window.CSR_CONFIG?.[varName]

export const removeThisWhenYouNeedMe = (functionName: string) => {
  if (!isDevelopment() || env.NEXT_PUBLIC_PREVENT_UNUSED_FUNCTIONS_ERROR_LOGS) {
    return
  }

  console.warn(
    `TODO: Delete 'removeThisWhenYouNeedMe' call from '${functionName}' and confirm the usage.`
  )
}

export const safeJSONParse = <T>(json: string): T => {
  try {
    return JSON.parse(json) as T
  } catch (e) {
    console.error("Error parsing JSON", e)
    return {} as T
  }
}

/**
 * Logs non-blocking errors only if SHOW_NON_BLOCKING_ERRORS environment variable is set to true.
 * This prevents in-memory storage from filling up during builds when errors are logged but execution continues.
 * @param args - Arguments to pass to console.error (same signature as console.error)
 */
export const logNonBlockingError = (...args: any[]) => {
  const showErrors = getEnvVariableValue("SHOW_NON_BLOCKING_ERRORS")
  if (showErrors) {
    console.error(...args)
  }
}
