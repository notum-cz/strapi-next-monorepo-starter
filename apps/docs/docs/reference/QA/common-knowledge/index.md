# Common Knowledge

Environment quirks, known issues, and workarounds worth not forgetting during manual QA.

<details>
<summary>Signing out in one tab doesn't refresh other open tabs</summary>

_Example note — this entry is a placeholder template for the page. Replace it with real findings as the team runs into them._

- **Symptom:** a QA account signed in across two open tabs — sign out in one, and the other tab keeps rendering the signed-in navbar.
- **Not a bug:** Better Auth's client session isn't broadcast across browser tabs, so the other tab has no way to know the session ended until it re-fetches.
- **When it clears:** on a manual refresh, or the next client-side navigation that triggers a session re-fetch.
- **What to do:** refresh the other tab before judging its state — don't file this as a defect.
- **Related:** [Logout test cases](../test-cases/logout.md)

</details>

<details>
<summary>Mocking the strapi.io site search means faking a Next.js Server Action, not a REST endpoint</summary>

- **Fact:** the search doesn't call a clean `/api/...` URL. It's a Next.js Server Action — a `POST` to the page route (`/`) that returns an RSC-encoded body (`0:{...}` / `1:{"pages":[],"blogPosts":[],"docs":[],...}`), not JSON.
- **Consequence:** `mockJson` (which sends `application/json`) won't work. Mock with `page.route("**/", ...)`, filter to `POST` (so the initial `GET` navigation still loads), and `route.fulfill` with `contentType: "text/x-component"` and the RSC body — or `route.abort()` for the unreachable case.
- **Why it's brittle:** the mocked body is coupled to strapi.io's server-action serialization. If Strapi changes the action's shape, the empty-results mock silently stops matching. Re-verify against a real response if it drifts.
- **Related:** [Site Search test cases](../test-cases/site-search.md), `qa/tests/playwright/e2e/mock/search.spec.ts`

</details>

<details>
<summary>E2E against strapi.io: dismiss the cookie banner and avoid "networkidle"</summary>

- **Symptom:** a spec that clicks something on strapi.io hangs and times out, even though the element is "visible"; or `waitForLoadState("networkidle")` never resolves under WebKit.
- **Cause:** a fresh browser context has no stored consent, so the Cookiebot banner overlays the page and intercepts clicks. Separately, strapi.io holds connections open (analytics, the Ask-AI widget), so the network never goes idle.
- **What to do:** dismiss the banner first (`helpers/cookies.ts` → "Use necessary cookies only"), and wait for a concrete element instead of `networkidle`. Both POM `goTo()`s already do this.
- **Related:** `qa/tests/playwright/helpers/cookies.ts`, `qa/tests/playwright/helpers/pages/SearchPage.ts`

</details>
