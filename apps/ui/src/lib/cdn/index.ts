import { logger } from "@/lib/logging"

import { azureFrontDoorProvider } from "./providers/azure-front-door"
import type { CdnPurgeOutcome, CdnPurgeProvider } from "./types"

export type { CdnPurgeOutcome, CdnPurgeProvider } from "./types"

/**
 * Resolves the active CDN purge provider, or `null` when none is configured.
 * Add new providers to this list; the first configured one wins. A provider
 * returns `null` from its factory until its env vars are set, so the CDN purge
 * feature stays inert by default — like the optional Entra SSO provider.
 */
export function resolveCdnProvider(): CdnPurgeProvider | null {
  const providers = [azureFrontDoorProvider()]

  return providers.find(Boolean) ?? null
}

/**
 * Purges the given paths via the configured CDN provider. Returns an
 * informative outcome when no provider is configured (the purge route turns
 * this into a 502 with the reason so editors understand why nothing happened).
 */
export async function purgeCdnCache(paths: string[]): Promise<CdnPurgeOutcome> {
  const provider = resolveCdnProvider()

  if (!provider) {
    logger.debug("CDN purge skipped because no provider is configured")

    return {
      ok: false,
      reason: "No CDN provider is configured for this environment.",
    }
  }

  return provider.purge(paths)
}
