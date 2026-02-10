import { afterAll, beforeAll, describe, expect, it } from "vitest"

import { setupStrapi, strapi, teardownStrapi } from "./helpers/strapi"

describe("App Test Suite", () => {
  beforeAll(async () => {
    await setupStrapi()
  }, 60000)

  afterAll(async () => {
    await teardownStrapi()
  }, 30000)

  describe("strapi instance", () => {
    it("is defined", () => {
      expect(strapi).toBeDefined()
    })

    it("has required content types registered", () => {
      const contentTypes = Object.keys(strapi.contentTypes)

      expect(contentTypes).toContain("api::page.page")
      expect(contentTypes).toContain("api::subscriber.subscriber")
      expect(contentTypes).toContain("api::navbar.navbar")
      expect(contentTypes).toContain("api::footer.footer")
      expect(contentTypes).toContain("api::redirect.redirect")
    })
  })

  describe("page content type", () => {
    it("has correct schema attributes", () => {
      const pageSchema = strapi.contentTypes["api::page.page"]

      expect(pageSchema.attributes.title).toBeDefined()
      expect(pageSchema.attributes.slug).toBeDefined()
      expect(pageSchema.attributes.fullPath).toBeDefined()
      expect(pageSchema.attributes.content).toBeDefined()
      expect(pageSchema.attributes.parent).toBeDefined()
      expect(pageSchema.attributes.children).toBeDefined()
      expect(pageSchema.attributes.seo).toBeDefined()
    })
  })
})
