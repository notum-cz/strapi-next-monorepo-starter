import type { LogDestination } from "@repo/logging"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const getEnvVarMock = vi.hoisted(() => vi.fn())

vi.mock("@/lib/env-vars", () => ({
  getEnvVar: getEnvVarMock,
}))

class TestLogDestination implements LogDestination {
  readonly lines: string[] = []

  write(chunk: string) {
    this.lines.push(chunk)
  }

  latest() {
    const line = this.lines.at(-1)
    if (!line) {
      throw new Error("No log lines captured")
    }

    return JSON.parse(line)
  }
}

async function importLogging(
  env: Partial<Record<string, unknown>> = {},
  destination = new TestLogDestination()
) {
  vi.resetModules()
  getEnvVarMock.mockImplementation((name: string) => {
    const defaults: Record<string, unknown> = {
      APP_ENV: "testing",
      LOG_LEVEL: "trace",
      NODE_ENV: "test",
      OTEL_SERVICE_NAME: "ui",
      SHOW_NON_BLOCKING_ERRORS: false,
    }

    return Object.hasOwn(env, name) ? env[name] : defaults[name]
  })
  Object.defineProperty(globalThis, "__LOG_DESTINATION__", {
    value: destination,
    configurable: true,
    writable: true,
  })

  const logging = await import("./logging")

  return { destination, logging }
}

describe("logging", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    delete globalThis.__LOG_DESTINATION__
  })

  it("writes structured logs with service and environment fields", async () => {
    const { destination, logging } = await importLogging()

    logging.logger.info("Test message", { route: "/api/test" })

    expect(destination.latest()).toMatchObject({
      service: "ui",
      environment: "testing",
      route: "/api/test",
      msg: "Test message",
    })
  })

  it("redacts common secrets before writing logs", async () => {
    const { destination, logging } = await importLogging()
    const sensitiveValue = "sensitive-value"

    logging.logger.info("Sensitive context", {
      headers: {
        authorization: sensitiveValue,
        cookie: sensitiveValue,
      },
      password: sensitiveValue,
      request: {
        token: sensitiveValue,
      },
      secret: sensitiveValue,
    })

    expect(destination.latest()).toMatchObject({
      headers: {
        authorization: "[redacted]",
        cookie: "[redacted]",
      },
      password: "[redacted]",
      request: {
        token: "[redacted]",
      },
      secret: "[redacted]",
    })
  })

  it("falls back to info level when LOG_LEVEL is invalid", async () => {
    const { destination, logging } = await importLogging({
      LOG_LEVEL: "LOG_LEVEL",
    })

    logging.logger.debug("Hidden debug message")
    logging.logger.info("Visible info message")

    expect(destination.lines).toHaveLength(1)
    expect(destination.latest()).toMatchObject({
      msg: "Visible info message",
    })
  })

  it("logs Error instances with serialized stack details", async () => {
    const { destination, logging } = await importLogging()

    logging.logError(new Error("Failure"), "Operation failed")

    expect(destination.latest()).toMatchObject({
      err: {
        message: "Failure",
        type: "Error",
      },
      msg: "Operation failed",
    })
  })

  it("logs non-Error thrown values", async () => {
    const { destination, logging } = await importLogging()

    logging.logError("plain failure", "Operation failed")

    expect(destination.latest()).toMatchObject({
      err: {
        message: "plain failure",
        type: "Error",
      },
      msg: "Operation failed",
    })
  })

  it("returns successful withSpan results and rethrows failures", async () => {
    const { logging } = await importLogging()

    await expect(
      logging.withSpan("test.success", async () => "ok")
    ).resolves.toBe("ok")

    await expect(
      logging.withSpan("test.failure", async () => {
        throw new Error("failed span")
      })
    ).rejects.toThrow("failed span")
  })

  it("logs non-blocking errors only when enabled", async () => {
    const disabled = await importLogging({ SHOW_NON_BLOCKING_ERRORS: false })
    disabled.logging.logNonBlockingError("disabled")
    expect(disabled.destination.lines).toHaveLength(0)

    const enabled = await importLogging({ SHOW_NON_BLOCKING_ERRORS: true })
    enabled.logging.logNonBlockingError("enabled")
    expect(enabled.destination.latest()).toMatchObject({
      args: ["enabled"],
      msg: "Non-blocking error",
    })
  })
})
