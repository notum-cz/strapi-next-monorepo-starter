import { getEnvVar } from "@/lib/env-vars"

/**
 * Logs non-blocking errors only if SHOW_NON_BLOCKING_ERRORS environment variable is set to true.
 * This prevents in-memory storage from filling up during builds when errors are logged but execution continues.
 * @param args - Arguments to pass to console.error (same signature as console.error)
 */
export const logNonBlockingError = (...args: unknown[]) => {
  const showErrors = getEnvVar("SHOW_NON_BLOCKING_ERRORS")
  if (showErrors) {
    console.error(...args)
  }
}

type LogContext = Record<string, unknown>

/**
 * Lightweight structured logger for UI server code (route handlers, lib).
 * Mirrors the helper surface the revalidation/CDN code expects.
 */
export const logger = {
  debug: (message: string, context?: LogContext) =>
    console.debug(message, context),
  // `console.info` is disallowed by the repo's no-console rule; route info
  // through the debug channel.
  info: (message: string, context?: LogContext) =>
    console.debug(message, context),
  warn: (message: string, context?: LogContext) =>
    console.warn(message, context),
  error: (message: string, context?: LogContext) =>
    console.error(message, context),
}

/**
 * Logs an error with normalized fields. Use in catch blocks.
 */
export const logError = (
  error: unknown,
  message: string,
  context?: LogContext
) => {
  const normalized =
    error instanceof Error
      ? { name: error.name, message: error.message, stack: error.stack }
      : { message: String(error) }

  console.error(message, { ...context, error: normalized })
}

/**
 * Runs `fn` directly. Present for call-site compatibility with the source
 * project's tracing helper; spans are a no-op in this starter.
 */
export const withSpan = <T>(
  _name: string,
  fn: () => Promise<T> | T,
  _attributes?: LogContext
): Promise<T> | T => fn()
