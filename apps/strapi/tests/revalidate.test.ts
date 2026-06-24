import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import revalidateServiceFactory from "../src/api/revalidate/services/revalidate"
import { registerAutoRevalidateMiddleware } from "../src/documentMiddlewares/revalidate"

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

const REVALIDATE_URL = "https://frontend.example/api/strapi-revalidate"
const CDN_PURGE_URL = "https://frontend.example/api/cdn-purge"

const findFetchCall = (
  mock: ReturnType<typeof vi.fn>,
  url: string
): [string, RequestInit] | undefined => {
  const call = mock.mock.calls.find(([target]) => target === url) as
    | [string, RequestInit]
    | undefined

  return call
}

describe("revalidate service", () => {
  const originalClientUrl = process.env.CLIENT_URL
  const originalSecret = process.env.STRAPI_REVALIDATE_SECRET
  const fetchMock = vi.fn()
  const errorMock = vi.fn()
  const infoMock = vi.fn()
  const documentsMock = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal("fetch", fetchMock)
    process.env.CLIENT_URL = "https://frontend.example"
    process.env.STRAPI_REVALIDATE_SECRET = "test-secret"
    vi.stubGlobal("strapi", {
      documents: documentsMock,
      service: vi.fn(() => ({})),
      log: {
        error: errorMock,
        info: infoMock,
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
    const revalidateCall = findFetchCall(fetchMock, REVALIDATE_URL)

    expect(revalidateCall).toBeDefined()
    expect(revalidateCall?.[1]).toMatchObject({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer test-secret",
      },
    })
    expect(JSON.parse(revalidateCall?.[1].body as string)).toEqual({
      uid: "api::page.page",
      next: {
        fullPaths: ["/en/about"],
        tags: ["strapi:api::page.page", "shared"],
      },
    })
    expect(result).toEqual({ revalidated: true })
    expect(findFetchCall(fetchMock, CDN_PURGE_URL)).toBeUndefined()
  })

  it("sends only the matching collection tag for non-page entities", async () => {
    fetchMock.mockResolvedValue(Response.json({ revalidated: true }))

    const service = revalidateServiceFactory()
    await service.run({
      uid: "api::subscriber.subscriber",
    })

    const revalidateCall = findFetchCall(fetchMock, REVALIDATE_URL)

    expect(JSON.parse(revalidateCall?.[1].body as string)).toEqual({
      uid: "api::subscriber.subscriber",
      next: {
        fullPaths: [],
        tags: ["strapi:api::subscriber.subscriber"],
      },
    })
    expect(findFetchCall(fetchMock, CDN_PURGE_URL)).toBeUndefined()
  })

  it("does not purge Front Door for redirect changes", async () => {
    fetchMock.mockResolvedValue(Response.json({ revalidated: true }))

    const service = revalidateServiceFactory()
    await service.run({
      uid: "api::redirect.redirect",
      fullPaths: ["/old-page"],
    })

    // Redirects rely on Next.js ISR refresh + Front Door TTL like the rest
    // of the content. AFD purge propagation is always slower than the page's
    // revalidate window, so an automatic purge would not arrive any sooner.
    expect(findFetchCall(fetchMock, CDN_PURGE_URL)).toBeUndefined()
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

  it("throws when the frontend revalidation endpoint fails", async () => {
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
    ).rejects.toThrow("Failed to revalidate Next.js cache.")

    expect(findFetchCall(fetchMock, CDN_PURGE_URL)).toBeUndefined()
  })
})

describe("auto revalidate document middleware", () => {
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

  it("revalidates redirect source paths on publish", async () => {
    const { middleware, runMock } = buildMiddleware()
    const nextResult = {
      entries: [
        {
          source: "/old-page",
          destination: "/new-page",
          status: "published",
        },
      ],
    }

    const result = await middleware(
      {
        uid: "api::redirect.redirect",
        action: "publish",
        contentType: { options: { draftAndPublish: true } },
      },
      vi.fn().mockResolvedValue(nextResult)
    )

    expect(runMock).toHaveBeenCalledWith({
      uid: "api::redirect.redirect",
      fullPaths: ["/old-page"],
      locale: undefined,
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

  it("skips duplicate update revalidation from hierarchy system writes", async () => {
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

  it("skips duplicate create revalidation from internal redirect jobs", async () => {
    const { middleware, runMock } = buildMiddleware()
    const next = vi.fn().mockResolvedValue({
      source: "/old-page",
      status: "published",
    })

    await middleware(
      {
        uid: "api::redirect.redirect",
        action: "create",
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
