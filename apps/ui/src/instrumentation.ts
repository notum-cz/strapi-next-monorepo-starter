import * as Sentry from "@sentry/nextjs"

import { initializeTelemetry } from "@/lib/telemetry"

export async function register() {
  const runtime = process.env.NEXT_RUNTIME

  if (runtime === "nodejs" || runtime === "edge") {
    await initializeTelemetry(runtime)
  }
}

// Sentry's Next.js request-error hook. No-ops when Sentry is not configured.
export const onRequestError = Sentry.captureRequestError
