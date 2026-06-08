/**
 * Minimal logging helpers for custom Strapi server code. Delegates to the
 * global `strapi.log` (Pino) when available and degrades to no-ops in unit
 * tests that do not stub `strapi`. `withSpan` is a transparent wrapper kept
 * for call-site compatibility; this starter does not ship OpenTelemetry.
 */
type LogContext = Record<string, unknown>

const strapiLog = ():
  | Record<string, (...args: unknown[]) => void>
  | undefined =>
  (
    globalThis as unknown as {
      strapi?: { log?: Record<string, (...a: unknown[]) => void> }
    }
  ).strapi?.log

export const logger = {
  debug: (message: string, context?: LogContext) =>
    strapiLog()?.debug?.(message, context),
  info: (message: string, context?: LogContext) =>
    strapiLog()?.info?.(message, context),
  warn: (message: string, context?: LogContext) =>
    strapiLog()?.warn?.(message, context),
  error: (message: string, context?: LogContext) =>
    strapiLog()?.error?.(message, context),
}

/**
 * Logs an error with normalized name/message fields. Use in catch blocks.
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

  strapiLog()?.error?.(message, { ...context, error: normalized })
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
