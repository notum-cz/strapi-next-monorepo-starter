/**
 * A pluggable telemetry target. Implement one per backend and register it in
 * `initializeTelemetry()`. A provider factory returns `null` until its env vars
 * are set, so the target stays inert by default — mirroring the pluggable CDN
 * purge provider in the UI app.
 */
export type TelemetryProvider = {
  readonly name: string
  /** Activates the backend exporter. Called once at process startup. */
  readonly initialize: () => void
}
