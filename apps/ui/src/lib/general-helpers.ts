import { env } from "@/env.mjs"

import { setupDaysJs } from "./dates"

export const isProduction = () => env.APP_ENV === "production"

export const isTesting = () => env.APP_ENV === "testing"

export const isDevelopment = () => env.NODE_ENV === "development"

export const setupLibraries = () => {
  setupDaysJs()
}

export const removeThisWhenYouNeedMe = (functionName: string) => {
  if (!isDevelopment() || env.NEXT_PUBLIC_PREVENT_UNUSED_FUNCTIONS_ERROR_LOGS) {
    return
  }

  console.warn(
    `TODO: Delete 'removeThisWhenYouNeedMe' call from '${functionName}' and confirm the usage.`
  )
}
