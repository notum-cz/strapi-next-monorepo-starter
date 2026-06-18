/** The Next.js runtime a telemetry provider is being initialized in. */
export type TelemetryRuntime = "nodejs" | "edge"

/**
 * A pluggable telemetry target. Implement one per backend and register it in
 * `initializeTelemetry()`. A provider factory returns `null` until its env vars
 * are set, so the target stays inert by default — mirroring the pluggable CDN
 * purge provider in `src/lib/cdn`.
 */
export type TelemetryProvider = {
  readonly name: string
  /**
   * Activates the backend. Called once per server runtime from the Next.js
   * `instrumentation.ts` `register()` hook. Providers that do not support a
   * given runtime should no-op for it.
   */
  readonly initialize: (runtime: TelemetryRuntime) => void | Promise<void>
}
