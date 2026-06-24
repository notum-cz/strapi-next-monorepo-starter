import { createLogging, type LogDestination } from "@repo/logging"

import { getEnvVar } from "@/lib/env-vars"

declare global {
  // Used by unit tests to capture Pino output without changing production logs.
  var __LOG_DESTINATION__: LogDestination | undefined
}

const serviceName = getEnvVar("OTEL_SERVICE_NAME") ?? "ui"
const environment = getEnvVar("APP_ENV") ?? getEnvVar("NODE_ENV") ?? "local"

const logging = createLogging({
  serviceName,
  environment,
  logLevel: getEnvVar("LOG_LEVEL"),
  pretty: getEnvVar("NODE_ENV") === "development",
  destination: globalThis.__LOG_DESTINATION__,
})

/**
 * Main app logger. Prefer this over console.* in server-side code so
 * logs are structured, redactable, and trace-correlated.
 */
export const logger = logging.logger

/**
 * Logs an error with stack/name/message fields and records it on the active
 * span. Use this in catch blocks when the error should reach the telemetry
 * backend.
 */
export const logError = logging.logError

/**
 * Creates a named OpenTelemetry span around an async operation. The span is
 * marked failed and records the exception if the operation throws.
 */
export const withSpan = logging.withSpan

/**
 * Logs non-blocking errors only if the SHOW_NON_BLOCKING_ERRORS environment
 * variable is set to true. This prevents in-memory storage from filling up
 * during builds when errors are logged but execution continues.
 * @param args - Arguments to log (same intent as console.error).
 */
export const logNonBlockingError = (...args: unknown[]) => {
  const showErrors = getEnvVar("SHOW_NON_BLOCKING_ERRORS")
  if (showErrors) {
    logger.error("Non-blocking error", { args })
  }
}
