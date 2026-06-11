import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { purgeCDNCache } from "../src/api/revalidate/services/cdn-cache"

const PURGE_URL = "https://frontend.example/api/cdn-purge"

describe("purgeCDNCache", () => {
  const originalClientUrl = process.env.CLIENT_URL
  const originalSecret = process.env.STRAPI_CDN_PURGE_SECRET
  const fetchMock = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal("fetch", fetchMock)
    vi.stubGlobal("strapi", {
      log: {
        debug: vi.fn(),
        info: vi.fn(),
        error: vi.fn(),
      },
    } as unknown as typeof globalThis.strapi)
    process.env.CLIENT_URL = "https://frontend.example"
    process.env.STRAPI_CDN_PURGE_SECRET = "test-secret"
  })

  afterEach(() => {
    process.env.CLIENT_URL = originalClientUrl
    process.env.STRAPI_CDN_PURGE_SECRET = originalSecret
    vi.unstubAllGlobals()
  })

  it("submits trimmed and deduplicated paths to the UI endpoint", async () => {
    fetchMock.mockResolvedValue(Response.json({ purged: true }))

    const result = await purgeCDNCache([" /about ", "/about", ""])

    expect(result).toMatchObject({
      purged: true,
      skipped: false,
      paths: ["/about"],
    })
    expect(fetchMock).toHaveBeenCalledWith(
      PURGE_URL,
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-secret",
        },
        body: JSON.stringify({ paths: ["/about"] }),
        signal: expect.any(AbortSignal),
      })
    )
  })

  it("skips the request when no paths are provided", async () => {
    const result = await purgeCDNCache(["", " "])

    expect(result).toEqual({ purged: false, skipped: true, paths: [] })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("propagates the upstream message when the UI endpoint returns 502", async () => {
    fetchMock.mockResolvedValue(
      Response.json(
        {
          purged: false,
          paths: ["/about"],
          message: "Azure Front Door rejected the purge with status 503.",
        },
        { status: 502 }
      )
    )

    const result = await purgeCDNCache(["/about"])

    expect(result).toMatchObject({
      purged: false,
      skipped: false,
      paths: ["/about"],
      error: {
        status: 502,
        message: "Azure Front Door rejected the purge with status 503.",
      },
    })
  })

  it("falls back to a generic message when the upstream body has no message", async () => {
    fetchMock.mockResolvedValue(
      new Response("plain text body", { status: 500 })
    )

    const result = await purgeCDNCache(["/about"])

    expect(result.error).toMatchObject({
      status: 500,
      message: "plain text body",
    })
  })

  it("returns a structured error when the UI endpoint is unreachable", async () => {
    fetchMock.mockRejectedValue(new Error("connect ECONNREFUSED"))

    const result = await purgeCDNCache(["/about"])

    expect(result).toMatchObject({
      purged: false,
      skipped: false,
      paths: ["/about"],
      error: {
        status: 0,
        message: "Could not reach CDN purge endpoint: connect ECONNREFUSED",
      },
    })
  })

  it("throws when configuration is missing", async () => {
    delete process.env.CLIENT_URL

    await expect(purgeCDNCache(["/about"])).rejects.toThrow(
      "Revalidation configuration missing"
    )
  })
})
