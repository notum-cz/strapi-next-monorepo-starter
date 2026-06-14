/**
 * Azure Monitor / Application Insights telemetry provider — the bundled example
 * of a pluggable telemetry target.
 *
 * Returns `null` from the factory when `APPLICATIONINSIGHTS_CONNECTION_STRING`
 * is unset, so the exporter is inert until configured — mirroring the optional
 * Azure Front Door CDN provider in the UI app. Remove the target by deleting
 * this file and its entry in `../index.ts`.
 */
import { initializeAzureMonitor } from "@repo/logging/azure"

import type { TelemetryProvider } from "../types"

export function azureMonitorProvider(): TelemetryProvider | null {
  const connectionString = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING

  if (!connectionString) {
    return null
  }

  const serviceName = process.env.OTEL_SERVICE_NAME ?? "strapi"

  return {
    name: "azure-monitor",
    initialize: () => {
      initializeAzureMonitor({ connectionString, serviceName })
    },
  }
}
