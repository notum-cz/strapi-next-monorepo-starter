// The strapi.io site search is a Next.js Server Action: a POST to the page
// route ("/") that returns an RSC payload with pages/blogPosts/docs/etc.
// arrays. These mocks intercept that POST — filtered by method so the initial
// GET navigation still loads for real — to force states the live search won't
// produce on demand. See the QA note on how brittle mocking a server action is.
import { expect, mockTest as test } from "../../helpers/fixtures"
import { SearchPage } from "../../helpers/pages/SearchPage"

// Shape mirrors the real server-action response, with every result group empty.
const EMPTY_RESULTS_RSC =
  '0:{"a":"$@1","f":"","q":"","i":false}\n' +
  '1:{"caseStudies":[],"pages":[],"blogPosts":[],"features":[],"docs":[]}\n'

test.describe("Site search — mocked backend responses", () => {
  test("shows the empty message when the search returns no matches", async ({
    page,
  }) => {
    await page.route("**/", async (route) => {
      if (route.request().method() !== "POST") {
        return route.continue()
      }
      await route.fulfill({
        status: 200,
        contentType: "text/x-component",
        body: EMPTY_RESULTS_RSC,
      })
    })

    const searchPage = new SearchPage(page)
    await searchPage.goTo()
    await searchPage.openSearch()
    await searchPage.search("headless cms")

    await expect(page.getByText("No results found.")).toBeVisible()
    await expect(searchPage.results).toHaveCount(0)
  })

  test("does not surface results when the search backend is unreachable", async ({
    page,
  }) => {
    // A dropped connection: the search action POST never completes. Unlike a
    // real outage, this is reproducible on demand — that's what earns the mock.
    await page.route("**/", async (route) => {
      if (route.request().method() !== "POST") {
        return route.continue()
      }
      await route.abort()
    })

    const searchPage = new SearchPage(page)
    await searchPage.goTo()
    await searchPage.openSearch()
    await searchPage.search("headless cms")

    // With the query request failing, no real result options are ever shown.
    await expect(searchPage.results).toHaveCount(0)
  })
})
