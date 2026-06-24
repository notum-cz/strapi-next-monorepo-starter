import { beforeEach, describe, expect, it, vi } from "vitest"

const { getEnvVarMock, purgeCdnCacheMock } = vi.hoisted(() => ({
  getEnvVarMock: vi.fn(),
  purgeCdnCacheMock: vi.fn(),
}))

vi.mock("@/lib/env-vars", () => ({
  getEnvVar: getEnvVarMock,
}))

vi.mock("@/lib/cdn", () => ({
  purgeCdnCache: purgeCdnCacheMock,
}))

vi.mock("@/lib/navigation", () => ({
  routing: {
    defaultLocale: "en",
  },
}))

import { POST } from "./route"

const request = (body: unknown, token?: string) =>
  new Request("http://localhost/api/cdn-purge", {
    method: "POST",
    body: JSON.stringify(body),
    headers: token
      ? {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      : { "Content-Type": "application/json" },
  })

describe("POST /api/cdn-purge", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getEnvVarMock.mockReturnValue("test-secret")
    purgeCdnCacheMock.mockResolvedValue({ ok: true })
  })

  it("expands default-locale variants before purging", async () => {
    const response = await POST(request({ paths: ["/about"] }, "test-secret"))

    expect(response.status).toBe(200)
    expect(purgeCdnCacheMock).toHaveBeenCalledWith(["/en/about", "/about"])
    await expect(response.json()).resolves.toMatchObject({
      purged: true,
      paths: ["/en/about", "/about"],
      at: expect.any(String),
    })
  })

  it("rejects a missing bearer token", async () => {
    const response = await POST(request({ paths: ["/about"] }))

    expect(response.status).toBe(401)
    expect(purgeCdnCacheMock).not.toHaveBeenCalled()
  })

  it("rejects an invalid bearer token", async () => {
    const response = await POST(request({ paths: ["/about"] }, "wrong-secret"))

    expect(response.status).toBe(401)
    expect(purgeCdnCacheMock).not.toHaveBeenCalled()
  })

  it("returns 502 with the reason when the purge is not submitted", async () => {
    purgeCdnCacheMock.mockResolvedValue({
      ok: false,
      reason: "No CDN provider is configured for this environment.",
    })

    const response = await POST(request({ paths: ["/about"] }, "test-secret"))

    expect(response.status).toBe(502)
    await expect(response.json()).resolves.toMatchObject({
      purged: false,
      paths: ["/en/about", "/about"],
      message: "No CDN provider is configured for this environment.",
    })
  })
})
