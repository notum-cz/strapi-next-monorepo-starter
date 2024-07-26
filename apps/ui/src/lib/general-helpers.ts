import { env } from "@/env.mjs"

import { setupDaysJs } from "./dates"

export const isProduction = () => env.NEXT_PUBLIC_NODE_ENV === "production"

export const isDevelopment = () => env.NEXT_PUBLIC_NODE_ENV === "development"

export const setupLibraries = () => {
  setupDaysJs()
}

export const removeThisWhenYouNeedMe = (functionName: string) => {
  if (
    env.NEXT_PUBLIC_NODE_ENV === "production" ||
    env.NEXT_PUBLIC_PREVENT_UNUSED_FUNCTIONS_ERROR_LOGS
  ) {
    return
  }

  console.warn(
    `TODO: Delete 'removeThisWhenYouNeedMe' call from '${functionName}' and confirm the usage.`
  )
}
