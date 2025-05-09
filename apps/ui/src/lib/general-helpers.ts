import { env } from "@/env.mjs"

import { setupDayJs } from "./dates"

export const isProduction = () => env.APP_ENV === "production"

export const isTesting = () => env.APP_ENV === "testing"

export const isDevelopment = () => env.NODE_ENV === "development"

export const setupLibraries = () => {
  setupDayJs()
}

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
