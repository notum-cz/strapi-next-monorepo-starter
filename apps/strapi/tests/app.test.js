const fs = require("fs")
const { setupStrapi, cleanupStrapi } = require("./helpers/strapi")

jest.setTimeout(5000)

beforeAll(async () => {
  await setupStrapi()
})

afterAll(async () => {
  await cleanupStrapi()
})

it("strapi is defined", () => {
  expect(strapi).toBeDefined()
})
