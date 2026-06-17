import { NextRequest } from "next/server"
import { beforeEach, describe, expect, it, vi } from "vitest"

import type * as RedirectsModule from "@/lib/redirects"

const { findRedirectForPathMock } = vi.hoisted(() => ({
  findRedirectForPathMock: vi.fn(),
}))

vi.mock("@/lib/navigation", () => ({
  routing: {
    defaultLocale: "en",
  },
}))

vi.mock("server-only", () => ({}))

// Keep the suite hermetic: importing the real `@/lib/redirects` below would
// otherwise pull in the Strapi client and the logger (both trigger env
// validation at import).
vi.mock("@/lib/strapi-api/content/server", () => ({
  fetchRedirects: vi.fn().mockResolvedValue([]),
}))

vi.mock("@/lib/logging", () => ({
  logger: {
    trace: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn(),
  },
  logError: vi.fn(),
  withSpan: vi.fn(),
}))

vi.mock("@/lib/redirects", async () => {
  const actual =
    await vi.importActual<typeof RedirectsModule>("@/lib/redirects")

  return {
    ...actual,
    findRedirectForPath: findRedirectForPathMock,
  }
})

import { redirectsProxy } from "./redirects"

describe("redirectsProxy", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    findRedirectForPathMock.mockResolvedValue(null)
  })

  it("redirects matching GET requests with a temporary status", async () => {
    findRedirectForPathMock.mockResolvedValue({
      destination: "/en/new-page",
    })

    const response = await redirectsProxy(
      new NextRequest("https://www.test/en/old-page?utm=test")
    )

    expect(response?.status).toBe(307)
    expect(response?.headers.get("location")).toBe(
      "https://www.test/new-page?utm=test"
    )
    expect(findRedirectForPathMock).toHaveBeenCalledWith("/en/old-page", "en")
  })

  it("continues when no redirect is found", async () => {
    const response = await redirectsProxy(
      new NextRequest("https://www.test/en/old-page")
    )

    expect(response).toBeNull()
  })

  it("ignores external redirect destinations", async () => {
    findRedirectForPathMock.mockResolvedValue({
      destination: "https://evil.com/new-page",
    })

    const response = await redirectsProxy(
      new NextRequest("https://www.test/en/old-page")
    )

    expect(response).toBeNull()
  })

  it("ignores non-GET and non-HEAD requests", async () => {
    const response = await redirectsProxy(
      new NextRequest("https://www.test/en/old-page", { method: "POST" })
    )

    expect(response).toBeNull()
    expect(findRedirectForPathMock).not.toHaveBeenCalled()
  })

  it("ignores Next.js prefetch requests", async () => {
    const response = await redirectsProxy(
      new NextRequest("https://www.test/en/old-page", {
        headers: {
          "next-router-prefetch": "1",
        },
      })
    )

    expect(response).toBeNull()
    expect(findRedirectForPathMock).not.toHaveBeenCalled()
  })
})
