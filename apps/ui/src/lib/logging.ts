import { getEnvVariableValue } from "@/lib/urls"

export const DEBUG_STRAPI_CLIENT_API_CALLS = getEnvVariableValue(
  "DEBUG_STRAPI_CLIENT_API_CALLS"
)

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
