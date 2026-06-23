import { SpanStatusCode, trace } from "@opentelemetry/api"
import pino, { type DestinationStream } from "pino"

export type LogContext = Record<string, unknown>
export type LogLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal"
export type PinoLogLevel = LogLevel | "silent"
export type LogDestination = DestinationStream

export interface CreateLoggerOptions {
  readonly serviceName: string
  readonly environment: string
  readonly logLevel?: string
  readonly pretty?: boolean
  readonly destination?: DestinationStream
}

export function createLogging({
  serviceName,
  environment,
  logLevel,
  pretty = false,
  destination,
}: CreateLoggerOptions) {
  const pinoOptions: pino.LoggerOptions = {
    level: getLogLevel(logLevel),
    base: {
      service: serviceName,
      environment,
    },
    // Redaction runs before a log line is written. These paths cover common
    // top-level fields and nested objects so accidental secrets are replaced
    // before logs are emitted locally or shipped to a telemetry backend.
    redact: {
      paths: [
        "authorization",
        "cookie",
        "headers.authorization",
        "headers.cookie",
        "password",
        "secret",
        "token",
        "apiKey",
        "clientSecret",
        "*.authorization",
        "*.cookie",
        "*.password",
        "*.secret",
        "*.token",
        "*.apiKey",
        "*.clientSecret",
      ],
      censor: "[redacted]",
    },
    serializers: {
      err: pino.stdSerializers.err,
      error: pino.stdSerializers.err,
    },
  }

  if (pretty && !destination) {
    pinoOptions.transport = {
      target: "pino-pretty",
      options: {
        colorize: true,
        ignore: "pid,hostname",
        translateTime: "HH:MM:ss.l",
      },
    }
  }

  const pinoLogger = destination
    ? pino(pinoOptions, destination)
    : pino(pinoOptions)

  function log(level: LogLevel, message: string, context?: LogContext) {
    pinoLogger[level](
      {
        ...context,
        // Spread last so the active span's IDs always win — a caller-provided
        // traceId/spanId must not override real trace correlation. When there is
        // no active span this returns {}, so it never clobbers caller context.
        ...getTraceContext(),
      },
      message
    )
  }

  const logger = {
    trace: (message: string, context?: LogContext) =>
      log("trace", message, context),
    debug: (message: string, context?: LogContext) =>
      log("debug", message, context),
    info: (message: string, context?: LogContext) =>
      log("info", message, context),
    warn: (message: string, context?: LogContext) =>
      log("warn", message, context),
    error: (message: string, context?: LogContext) =>
      log("error", message, context),
    fatal: (message: string, context?: LogContext) =>
      log("fatal", message, context),
  }

  function logError(
    error: unknown,
    message = "Unhandled error",
    context?: LogContext
  ) {
    const normalizedError = normalizeError(error)

    trace.getActiveSpan()?.recordException(normalizedError)

    pinoLogger.error(
      {
        ...context,
        // Active span IDs win over any caller-provided traceId/spanId; `err`
        // stays last so the normalized error is never overridden.
        ...getTraceContext(),
        err: normalizedError,
      },
      message
    )
  }

  async function withSpan<T>(
    name: string,
    operation: () => Promise<T>,
    attributes?: Record<string, string | number | boolean | undefined>
  ): Promise<T> {
    const tracer = trace.getTracer(serviceName)

    return tracer.startActiveSpan(name, async (span) => {
      try {
        if (attributes) {
          for (const [key, value] of Object.entries(attributes)) {
            if (value !== undefined) {
              span.setAttribute(key, value)
            }
          }
        }

        return await operation()
      } catch (error) {
        const normalizedError = normalizeError(error)

        span.recordException(normalizedError)
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: normalizedError.message,
        })

        throw error
      } finally {
        span.end()
      }
    })
  }

  return {
    logger,
    logError,
    withSpan,
  }
}

/**
 * Reads the active OpenTelemetry span, if one exists, and returns IDs that let
 * logs be correlated with traces in the configured telemetry backend (e.g.
 * Azure Monitor/Application Insights).
 */
function getTraceContext() {
  const span = trace.getActiveSpan()
  const spanContext = span?.spanContext()

  if (!spanContext) {
    return {}
  }

  return {
    traceId: spanContext.traceId,
    spanId: spanContext.spanId,
  }
}

function getLogLevel(level: string | undefined): PinoLogLevel {
  const allowedLevels = new Set([
    "trace",
    "debug",
    "info",
    "warn",
    "error",
    "fatal",
    "silent",
  ])

  return allowedLevels.has(level ?? "") ? (level as PinoLogLevel) : "info"
}

function normalizeError(error: unknown): Error {
  if (error instanceof Error) {
    return error
  }

  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    const normalizedError = new Error(error.message)
    Object.defineProperty(normalizedError, "name", {
      value:
        "name" in error && typeof error.name === "string"
          ? error.name
          : "Error",
    })

    return normalizedError
  }

  return new Error(String(error))
}
