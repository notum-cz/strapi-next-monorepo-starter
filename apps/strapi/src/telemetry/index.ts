import { logError, logger } from "../utils/logging"
import { azureMonitorProvider } from "./providers/azure-monitor"
import type { TelemetryProvider } from "./types"

export type { TelemetryProvider } from "./types"

/**
 * Initializes every configured telemetry target. Add providers to this list;
 * each one stays inert until its environment variables are set, so Strapi logs
 * to stdout by default and ships to a backend only when configured.
 *
 * Run this as early as possible at process startup (see `src/instrumentation.ts`)
 * so backend exporters can instrument modules before the server starts.
 */
export function initializeTelemetry(): void {
  const providers: TelemetryProvider[] = [azureMonitorProvider()].filter(
    (provider): provider is TelemetryProvider => provider !== null
  )

  // Telemetry is best-effort: a misconfigured provider must not crash startup,
  // so isolate each provider and continue past failures.
  for (const provider of providers) {
    try {
      provider.initialize()
      logger.info("Telemetry provider initialized", { provider: provider.name })
    } catch (error) {
      logError(error, "Telemetry provider failed to initialize", {
        provider: provider.name,
      })
    }
  }
}
