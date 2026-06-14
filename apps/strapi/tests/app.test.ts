import { readFileSync } from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

// Reads a content-type schema straight from disk, so these checks don't require
// booting a Strapi instance or a database (which would block CI). The schema
// files are the source of truth Strapi loads at runtime anyway.
const readSchema = (api: string, contentType: string) => {
  const file = path.resolve(
    process.cwd(),
    "src/api",
    api,
    "content-types",
    contentType,
    "schema.json"
  )

  return JSON.parse(readFileSync(file, "utf8")) as {
    attributes: Record<string, unknown>
  }
}

describe("content-type schemas", () => {
  it("registers the expected content types", () => {
    // Each entry must have a readable schema file on disk.
    for (const [api, contentType] of [
      ["page", "page"],
      ["subscriber", "subscriber"],
      ["navbar", "navbar"],
      ["footer", "footer"],
      ["redirect", "redirect"],
      ["hierarchy", "hierarchy"],
    ]) {
      expect(readSchema(api, contentType).attributes).toBeTypeOf("object")
    }
  })

  it("defines the expected attributes on the page schema", () => {
    const { attributes } = readSchema("page", "page")

    for (const field of [
      "title",
      "slug",
      "fullPath",
      "content",
      "parent",
      "children",
      "seo",
    ]) {
      expect(attributes[field]).toBeDefined()
    }
  })

  it("defines source and destination on the redirect schema", () => {
    const { attributes } = readSchema("redirect", "redirect")

    expect(attributes.source).toBeDefined()
    expect(attributes.destination).toBeDefined()
  })
})
