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

const tryParseJSON = (value: string): unknown => {
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

export const getAuthErrorMessage = (
  rawMessage: string | undefined,
  fallback: string
) => {
  if (!rawMessage) {
    return fallback
  }

  const parsed = tryParseJSON(rawMessage)
  if (parsed && typeof parsed === "object" && "message" in parsed) {
    const parsedMessage = (parsed as { message?: unknown }).message
    if (typeof parsedMessage === "string" && parsedMessage.length > 0) {
      return parsedMessage
    }
  }

  return rawMessage
}
