import { useAzureMonitor as configureAzureMonitor } from "@azure/monitor-opentelemetry"

export interface AzureMonitorOptions {
  readonly connectionString?: string
  readonly serviceName: string
}

/**
 * Initializes the Azure Monitor / Application Insights OpenTelemetry exporter.
 *
 * Returns `false` (and does nothing) when no connection string is provided, so
 * the call is safe to make unconditionally — the exporter only activates once
 * `APPLICATIONINSIGHTS_CONNECTION_STRING` is set. This is the example target
 * for the `@repo/logging` package; swap or add targets via the app's telemetry
 * provider registry.
 */
export function initializeAzureMonitor({
  connectionString,
  serviceName,
}: AzureMonitorOptions): boolean {
  if (!connectionString) {
    return false
  }

  process.env.OTEL_SERVICE_NAME ??= serviceName

  configureAzureMonitor({
    azureMonitorExporterOptions: {
      connectionString,
    },
  })

  return true
}
