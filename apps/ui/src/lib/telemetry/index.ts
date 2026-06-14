import { azureMonitorProvider } from "./providers/azure-monitor"
import { sentryProvider } from "./providers/sentry"
import type { TelemetryProvider, TelemetryRuntime } from "./types"

export type { TelemetryProvider, TelemetryRuntime } from "./types"

/**
 * Initializes every configured telemetry target for the given runtime. Add
 * providers to this list; each one stays inert until its environment variables
 * are set, so the UI logs to stdout by default and ships to a backend only when
 * configured. Called from the Next.js `instrumentation.ts` `register()` hook.
 *
 * Kept free of the pino logger import: `register()` also runs in the edge
 * runtime, where pino is not available. Providers log their own status.
 */
export async function initializeTelemetry(
  runtime: TelemetryRuntime
): Promise<void> {
  const providers: TelemetryProvider[] = [
    azureMonitorProvider(),
    sentryProvider(),
  ].filter((provider): provider is TelemetryProvider => provider !== null)

  for (const provider of providers) {
    await provider.initialize(runtime)
  }
}
