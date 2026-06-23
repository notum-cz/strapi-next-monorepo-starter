import { createLogging } from "@repo/logging"

const serviceName = process.env.OTEL_SERVICE_NAME ?? "strapi"
const environment = process.env.APP_ENV ?? process.env.NODE_ENV ?? "local"

const logging = createLogging({
  serviceName,
  environment,
  logLevel: process.env.LOG_LEVEL,
  pretty: process.env.NODE_ENV === "development",
})

/**
 * Main Strapi app logger for custom server code. Prefer this over
 * console.* when adding new code so logs are structured and trace-correlated.
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
