import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import revalidateServiceFactory from "../src/api/revalidate/services/revalidate"
import { registerAutoRevalidateMiddleware } from "../src/documentMiddlewares/revalidate"

describe("revalidate service", () => {
  const originalClientUrl = process.env.CLIENT_URL
  const originalSecret = process.env.STRAPI_REVALIDATE_SECRET
  const fetchMock = vi.fn()
  const errorMock = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal("fetch", fetchMock)
    process.env.CLIENT_URL = "https://frontend.example"
    process.env.STRAPI_REVALIDATE_SECRET = "test-secret"
    vi.stubGlobal("strapi", {
      log: {
        error: errorMock,
      },
    } as unknown as typeof globalThis.strapi)
  })

  afterEach(() => {
    process.env.CLIENT_URL = originalClientUrl
    process.env.STRAPI_REVALIDATE_SECRET = originalSecret
    vi.unstubAllGlobals()
  })

  it("normalizes and deduplicates the outgoing revalidation payload", async () => {
    fetchMock.mockResolvedValue(
      Response.json(
        {
          revalidated: true,
        },
        { status: 200 }
      )
    )

    const service = revalidateServiceFactory()
    const result = await service.run({
      uid: "api::page.page",
      fullPaths: [" /about ", "about", ""],
      locale: "en",
      tags: [" shared ", "", "shared"],
    })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(
      "https://frontend.example/api/strapi-revalidate",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
    )
    const fetchCall = fetchMock.mock.calls[0]

    expect(fetchCall).toBeDefined()

    const requestInit = fetchCall?.[1]

    expect(requestInit).toBeDefined()
    expect(typeof requestInit?.body).toBe("string")
    expect(JSON.parse(requestInit?.body as string)).toEqual({
      uid: "api::page.page",
      secret: "test-secret",
      fullPaths: ["/en/about"],
      tags: ["strapi:api::page.page", "shared"],
    })
    expect(result).toEqual({ revalidated: true })
  })

  it("throws when required configuration is missing", async () => {
    delete process.env.CLIENT_URL

    const service = revalidateServiceFactory()

    await expect(
      service.run({
        uid: "api::page.page",
        fullPaths: ["/about"],
      })
    ).rejects.toThrow(
      "Revalidation configuration missing. Ensure CLIENT_URL and STRAPI_REVALIDATE_SECRET are set."
    )
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("logs and throws when the frontend revalidation endpoint fails", async () => {
    fetchMock.mockResolvedValue(
      new Response("boom", {
        status: 500,
      })
    )

    const service = revalidateServiceFactory()

    await expect(
      service.run({
        uid: "api::page.page",
        fullPaths: ["/about"],
      })
    ).rejects.toThrow("Failed to revalidate frontend cache.")

    expect(errorMock).toHaveBeenCalledWith(
      expect.stringContaining(
        'Revalidation request failed (500) for "api::page.page" "/about": boom'
      )
    )
  })
})

describe("auto revalidate document middleware", () => {
  const buildMiddleware = () => {
    const runMock = vi.fn()
    const useMock = vi.fn()
    const errorMock = vi.fn()
    const strapiMock = {
      documents: {
        use: useMock,
      },
      service: vi.fn(() => ({
        run: runMock,
      })),
      log: {
        error: errorMock,
      },
    }

    registerAutoRevalidateMiddleware({
      strapi: strapiMock as never,
    })

    const registeredMiddleware = useMock.mock.calls[0]?.[0]

    expect(registeredMiddleware).toBeTypeOf("function")

    return {
      middleware: registeredMiddleware as (
        context: Record<string, unknown>,
        next: () => Promise<unknown>
      ) => Promise<unknown>,
      runMock,
      errorMock,
    }
  }

  it("revalidates page paths on publish", async () => {
    const { middleware, runMock } = buildMiddleware()
    const nextResult = {
      entries: [
        {
          locale: "en",
          fullPath: "/about",
          status: "published",
        },
      ],
    }

    const result = await middleware(
      {
        uid: "api::page.page",
        action: "publish",
        params: { locale: "en" },
        contentType: { options: { draftAndPublish: true } },
      },
      vi.fn().mockResolvedValue(nextResult)
    )

    expect(runMock).toHaveBeenCalledWith({
      uid: "api::page.page",
      fullPaths: ["/about"],
      locale: "en",
    })
    expect(result).toBe(nextResult)
  })

  it("revalidates collection tags for public single types on update", async () => {
    const { middleware, runMock } = buildMiddleware()

    await middleware(
      {
        uid: "api::navbar.navbar",
        action: "update",
        params: {
          data: {
            updatedBy: "admin-user",
          },
        },
        contentType: { options: { draftAndPublish: false } },
      },
      vi.fn().mockResolvedValue({
        status: "draft",
      })
    )

    expect(runMock).toHaveBeenCalledWith({
      uid: "api::navbar.navbar",
      tags: undefined,
    })
  })

  it("skips duplicate update revalidation from internal hierarchy jobs", async () => {
    const { middleware, runMock } = buildMiddleware()
    const next = vi.fn().mockResolvedValue({ status: "published" })

    await middleware(
      {
        uid: "api::page.page",
        action: "update",
        params: {
          data: {
            updatedBy: null,
          },
        },
        contentType: { options: { draftAndPublish: true } },
      },
      next
    )

    expect(next).toHaveBeenCalledTimes(1)
    expect(runMock).not.toHaveBeenCalled()
  })

  it("does not revalidate draft-only updates for draft-and-publish content", async () => {
    const { middleware, runMock } = buildMiddleware()

    await middleware(
      {
        uid: "api::page.page",
        action: "update",
        params: { locale: "en" },
        contentType: { options: { draftAndPublish: true } },
      },
      vi.fn().mockResolvedValue({
        fullPath: "/about",
        locale: "en",
        status: "draft",
      })
    )

    expect(runMock).not.toHaveBeenCalled()
  })
})
