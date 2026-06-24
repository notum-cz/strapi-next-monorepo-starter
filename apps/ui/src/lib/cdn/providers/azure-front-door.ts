/**
 * Azure Front Door CDN purge provider — the bundled example of a pluggable
 * CDN provider. Auth uses the Container App's user-assigned managed identity
 * (IMDS token endpoint), so no secrets are stored in the app.
 *
 * Returns `null` from the factory when any required AZURE_* env var is unset,
 * so the feature is inert until configured — mirroring the optional Microsoft
 * Entra SSO provider in apps/strapi/config/auth-providers.ts.
 */
import { getEnvVar } from "@/lib/env-vars"
import { logError, logger } from "@/lib/logging"

import type { CdnPurgeOutcome, CdnPurgeProvider } from "../types"

const ARM_RESOURCE = "https://management.azure.com/"
const ARM_API_VERSION = "2024-02-01"
const UI_ENDPOINT_NAME = "ui"

interface ImdsTokenResponse {
  access_token: string
  expires_on: string
  resource: string
  token_type: string
}

let cachedToken: null | { value: string; expiresAt: number } = null

async function getArmToken(clientId: string): Promise<string | null> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.value
  }

  const imdsEndpoint = getEnvVar("IDENTITY_ENDPOINT")
  const imdsHeader = getEnvVar("IDENTITY_HEADER")
  if (!imdsEndpoint || !imdsHeader) {
    logger.error("CDN purge skipped because managed identity is missing")

    return null
  }

  const url = new URL(imdsEndpoint)
  url.searchParams.set("api-version", "2019-08-01")
  url.searchParams.set("resource", ARM_RESOURCE)
  url.searchParams.set("client_id", clientId)

  const res = await fetch(url.href, {
    headers: { "X-IDENTITY-HEADER": imdsHeader },
  })

  if (!res.ok) {
    const body = await res.text()
    logger.error("CDN IMDS token request failed", {
      status: res.status,
      body,
    })

    return null
  }

  const data = (await res.json()) as ImdsTokenResponse
  const expiresAtMs = Number(data.expires_on) * 1000 - 60_000
  cachedToken = { value: data.access_token, expiresAt: expiresAtMs }

  return data.access_token
}

type AzureConfig = {
  subscriptionId: string
  resourceGroup: string
  profileName: string
  miClientId: string
}

async function purgeAzureFrontDoor(
  contentPaths: string[],
  config: AzureConfig
): Promise<CdnPurgeOutcome> {
  if (contentPaths.length === 0) {
    return { ok: false, reason: "No paths to purge." }
  }

  try {
    const token = await getArmToken(config.miClientId)
    if (!token) {
      return {
        ok: false,
        reason: "Could not obtain managed identity token for the CDN.",
      }
    }

    const purgeUrl =
      `https://management.azure.com/subscriptions/${config.subscriptionId}` +
      `/resourceGroups/${config.resourceGroup}` +
      `/providers/Microsoft.Cdn/profiles/${config.profileName}` +
      `/afdEndpoints/${UI_ENDPOINT_NAME}/purge` +
      `?api-version=${ARM_API_VERSION}`

    const res = await fetch(purgeUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ contentPaths }),
    })

    // AFD purge is async; 202 Accepted is the success response.
    if (res.status !== 202 && !res.ok) {
      const body = await res.text()
      logger.error("CDN purge failed", {
        status: res.status,
        body,
        contentPaths,
      })

      return {
        ok: false,
        reason: `Azure Front Door rejected the purge with status ${res.status}.`,
      }
    }

    logger.debug("CDN purge submitted", { contentPaths })

    return { ok: true }
  } catch (err) {
    logError(err, "CDN purge error", { contentPaths })

    return {
      ok: false,
      reason:
        err instanceof Error && err.message
          ? `CDN purge threw: ${err.message}`
          : "CDN purge threw an unknown error.",
    }
  }
}

/**
 * Returns an Azure Front Door purge provider, or `null` when any required
 * AZURE_* env var is unset (local/dev or non-Azure deployments).
 */
export function azureFrontDoorProvider(): CdnPurgeProvider | null {
  const subscriptionId = getEnvVar("AZURE_SUBSCRIPTION_ID")
  const resourceGroup = getEnvVar("AZURE_RESOURCE_GROUP")
  const profileName = getEnvVar("AZURE_FRONT_DOOR_PROFILE")
  const miClientId = getEnvVar("AZURE_MI_CLIENT_ID")

  if (!subscriptionId || !resourceGroup || !profileName || !miClientId) {
    return null
  }

  const config: AzureConfig = {
    subscriptionId,
    resourceGroup,
    profileName,
    miClientId,
  }

  return {
    name: "azure-front-door",
    purge: (paths) => purgeAzureFrontDoor(paths, config),
  }
}
