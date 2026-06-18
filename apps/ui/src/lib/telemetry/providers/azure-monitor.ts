/**
 * Azure Monitor / Application Insights telemetry provider — the bundled example
 * of a pluggable telemetry target.
 *
 * Returns `null` from the factory when `APPLICATIONINSIGHTS_CONNECTION_STRING`
 * is unset, so the exporter is inert until configured — mirroring the optional
 * Azure Front Door CDN provider in `src/lib/cdn`. Remove the target by deleting
 * this file and its entry in `../index.ts`.
 *
 * The Azure Monitor SDK relies on Node APIs, so it only initializes in the
 * `nodejs` runtime.
 */
import { getEnvVar } from "@/lib/env-vars"

import type { TelemetryProvider } from "../types"

export function azureMonitorProvider(): TelemetryProvider | null {
  const connectionString = getEnvVar("APPLICATIONINSIGHTS_CONNECTION_STRING")

  if (!connectionString) {
    return null
  }

  const serviceName = getEnvVar("OTEL_SERVICE_NAME") ?? "ui"

  return {
    name: "azure-monitor",
    initialize: async (runtime) => {
      if (runtime !== "nodejs") {
        return
      }

      // Imported lazily so the Azure SDK never enters the edge bundle.
      const { initializeAzureMonitor } = await import("@repo/logging/azure")

      initializeAzureMonitor({ connectionString, serviceName })
    },
  }
}
