import jwt from "jsonwebtoken"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { validateAdminToken } from "../src/utils/validate-admin-token"

const SECRET = "test-admin-secret"

const activeUser = { id: 1, isActive: true, blocked: false }

const findOneMock = vi.fn()

const buildStrapi = () =>
  ({
    config: {
      get: (key: string) => (key === "admin.auth.secret" ? SECRET : undefined),
    },
    db: {
      query: vi.fn(() => ({ findOne: findOneMock })),
    },
  }) as never

const sign = (
  payload: Record<string, unknown>,
  options?: jwt.SignOptions,
  secret = SECRET
) => jwt.sign(payload, secret, options)

const bearer = (token: string) => ({ authorization: `Bearer ${token}` })

const accessPayload = { userId: "1", sessionId: "s1", type: "access" }

describe("validateAdminToken", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    findOneMock.mockResolvedValue(activeUser)
  })

  it("accepts a valid, unexpired access token for an active user", async () => {
    const token = sign(accessPayload, { expiresIn: "1h" })

    const result = await validateAdminToken(buildStrapi(), bearer(token))

    expect(result).toEqual({ valid: true, userId: "1" })
    expect(findOneMock).toHaveBeenCalledWith({
      where: { id: "1" },
      select: ["id", "isActive", "blocked"],
    })
  })

  it("rejects when no authorization header is present", async () => {
    const result = await validateAdminToken(buildStrapi(), {})

    expect(result).toEqual({ valid: false, error: "No token provided" })
  })

  it("rejects a non-Bearer authorization scheme", async () => {
    const result = await validateAdminToken(buildStrapi(), {
      authorization: "Basic abc",
    })

    expect(result).toEqual({
      valid: false,
      error: "Invalid authorization header",
    })
  })

  it("rejects a token signed with the wrong secret", async () => {
    const token = sign(accessPayload, { expiresIn: "1h" }, "wrong-secret")

    const result = await validateAdminToken(buildStrapi(), bearer(token))

    expect(result.valid).toBe(false)
  })

  it("rejects an expired token", async () => {
    const token = sign(accessPayload, { expiresIn: -10 })

    const result = await validateAdminToken(buildStrapi(), bearer(token))

    expect(result.valid).toBe(false)
  })

  it("rejects a token that never expires", async () => {
    const token = sign(accessPayload)

    const result = await validateAdminToken(buildStrapi(), bearer(token))

    expect(result.valid).toBe(false)
  })

  it("rejects a token forged with the 'none' algorithm", async () => {
    // eslint-disable-next-line sonarjs/insecure-jwt-token, sonarjs/hardcoded-secret-signatures -- intentionally forging an insecure token to assert it is rejected
    const token = jwt.sign({ ...accessPayload, exp: 9999999999 }, "", {
      algorithm: "none",
    })

    const result = await validateAdminToken(buildStrapi(), bearer(token))

    expect(result.valid).toBe(false)
  })

  it("rejects a non-access (e.g. refresh) token", async () => {
    const token = sign(
      { ...accessPayload, type: "refresh" },
      { expiresIn: "1h" }
    )

    const result = await validateAdminToken(buildStrapi(), bearer(token))

    expect(result.valid).toBe(false)
  })

  it("rejects when the user no longer exists", async () => {
    findOneMock.mockResolvedValue(null)
    const token = sign(accessPayload, { expiresIn: "1h" })

    const result = await validateAdminToken(buildStrapi(), bearer(token))

    expect(result.valid).toBe(false)
  })

  it("rejects when the user is deactivated", async () => {
    findOneMock.mockResolvedValue({ id: 1, isActive: false, blocked: false })
    const token = sign(accessPayload, { expiresIn: "1h" })

    const result = await validateAdminToken(buildStrapi(), bearer(token))

    expect(result.valid).toBe(false)
  })

  it("rejects when the user is blocked", async () => {
    findOneMock.mockResolvedValue({ id: 1, isActive: true, blocked: true })
    const token = sign(accessPayload, { expiresIn: "1h" })

    const result = await validateAdminToken(buildStrapi(), bearer(token))

    expect(result.valid).toBe(false)
  })
})
