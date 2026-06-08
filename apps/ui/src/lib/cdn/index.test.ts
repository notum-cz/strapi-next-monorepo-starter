import { beforeEach, describe, expect, it, vi } from "vitest"

const { getEnvVarMock } = vi.hoisted(() => ({ getEnvVarMock: vi.fn() }))

vi.mock("@/lib/env-vars", () => ({ getEnvVar: getEnvVarMock }))

import { purgeCdnCache, resolveCdnProvider } from "./index"

describe("CDN provider registry", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns null when no AZURE_* vars are set", () => {
    getEnvVarMock.mockReturnValue(undefined)

    expect(resolveCdnProvider()).toBeNull()
  })

  it("purgeCdnCache reports an informative reason when unconfigured", async () => {
    getEnvVarMock.mockReturnValue(undefined)

    await expect(purgeCdnCache(["/about"])).resolves.toEqual({
      ok: false,
      reason: "No CDN provider is configured for this environment.",
    })
  })

  it("resolves the Azure provider when all AZURE_* vars are set", () => {
    getEnvVarMock.mockImplementation((key: string) =>
      key.startsWith("AZURE_") ? "value" : undefined
    )

    const provider = resolveCdnProvider()

    expect(provider?.name).toBe("azure-front-door")
  })
})
