import { getEnvVar } from "@/lib/env-vars"

import { setupDayJs } from "./dates"

export const isProduction = () => getEnvVar("APP_ENV") === "production"

export const isTesting = () => getEnvVar("APP_ENV") === "testing"

export const isDevelopment = () => getEnvVar("NODE_ENV") === "development"

export const setupLibraries = () => {
  setupDayJs()
}

export const removeThisWhenYouNeedMe = (functionName: string) => {
  if (
    !isDevelopment() ||
    getEnvVar("NEXT_PUBLIC_PREVENT_UNUSED_FUNCTIONS_ERROR_LOGS")
  ) {
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
