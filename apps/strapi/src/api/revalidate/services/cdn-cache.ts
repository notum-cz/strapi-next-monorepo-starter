import { normalizeFullPaths, readCdnPurgeConfig } from "./helpers"
import { logError, logger } from "../../../utils/logging"

// Cap how long we wait on the UI purge endpoint so a stalled upstream cannot
// hang the request (and the admin widget) indefinitely.
const PURGE_TIMEOUT_MS = 15_000

type PurgeError = {
  status: number
  message: string
}

export type PurgeResult = {
  purged: boolean
  skipped: boolean
  paths: string[]
  result?: unknown
  error?: PurgeError
}

/**
 * Sends a CDN purge request to the Next.js purge endpoint. Used for
 * operator-driven purges from the admin homepage widget. Routine page
 * updates rely on the ISR `revalidate` window and SWR background refresh
 * instead, so they do not call this.
 *
 * On failure, the `error` field carries a message extracted from the upstream
 * response so callers (Strapi controllers, the widget) can surface it to
 * editors instead of a generic "something went wrong".
 */
export async function purgeCDNCache(
  paths: Iterable<string>
): Promise<PurgeResult> {
  const normalizedPaths = normalizeFullPaths(paths)

  if (normalizedPaths.length === 0) {
    logger.debug("CDN purge skipped because no paths were provided")

    return { purged: false, skipped: true, paths: [] }
  }

  const { clientUrl, secret } = readCdnPurgeConfig()

  logger.debug("Submitting CDN purge request", {
    clientUrl,
    pathCount: normalizedPaths.length,
    paths: normalizedPaths,
  })

  let response: Response

  try {
    response = await fetch(`${clientUrl}/api/cdn-purge`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({ paths: normalizedPaths }),
      signal: AbortSignal.timeout(PURGE_TIMEOUT_MS),
    })
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? `Could not reach CDN purge endpoint: ${error.message}`
        : "Could not reach CDN purge endpoint."

    logError(error, "CDN purge request failed", {
      pathCount: normalizedPaths.length,
      paths: normalizedPaths,
    })

    return {
      purged: false,
      skipped: false,
      paths: normalizedPaths,
      error: { status: 0, message },
    }
  }

  if (!response.ok) {
    const fallbackMessage = `CDN purge endpoint responded ${response.status}.`
    const upstreamMessage = await extractUpstreamMessage(response)

    logger.error("CDN purge failed", {
      status: response.status,
      message: upstreamMessage,
      pathCount: normalizedPaths.length,
      paths: normalizedPaths,
    })

    return {
      purged: false,
      skipped: false,
      paths: normalizedPaths,
      error: {
        status: response.status,
        message: upstreamMessage ?? fallbackMessage,
      },
    }
  }

  // A successful purge may return an empty or non-JSON body; parse defensively
  // so a missing/odd body never turns a 2xx response into a thrown 500.
  const result = await parseJsonSafely(response)

  logger.debug("CDN purge completed", {
    pathCount: normalizedPaths.length,
    paths: normalizedPaths,
  })

  return { purged: true, skipped: false, paths: normalizedPaths, result }
}

/**
 * Parses a successful response body as JSON, tolerating empty or non-JSON
 * bodies (returns `undefined` instead of throwing). The purge already
 * succeeded by the time this runs, so the body is informational only.
 */
async function parseJsonSafely(response: Response): Promise<unknown> {
  const raw = await response.text()

  if (!raw) {
    return undefined
  }

  try {
    return JSON.parse(raw)
  } catch {
    return undefined
  }
}

/**
 * Pulls a human-readable message out of an error response. The Next.js purge
 * endpoint returns JSON with either a `message` (validation/auth errors) or a
 * `purged: false` body with a `message` field on CDN failure. Falls
 * back to the raw text when the body is not parseable JSON.
 */
async function extractUpstreamMessage(
  response: Response
): Promise<string | undefined> {
  const raw = await response.text()

  if (!raw) {
    return undefined
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>

    if (typeof parsed.message === "string" && parsed.message.length > 0) {
      return parsed.message
    }

    const nestedError = parsed.error
    if (
      nestedError &&
      typeof nestedError === "object" &&
      "message" in nestedError &&
      typeof (nestedError as Record<string, unknown>).message === "string"
    ) {
      return (nestedError as { message: string }).message
    }
  } catch {
    // Body was not JSON — fall through to the raw text.
  }

  const trimmed = raw.trim()

  return trimmed.length > 0 ? trimmed : undefined
}
