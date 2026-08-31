# Exercise 0 — Setup (do this before the workshop)

## 1. Branch

```bash
git fetch origin
git checkout feat/STAR-0-backport-azure-pipeline
git pull
git checkout -b test/STAR-0-qa-workshop-<yourname>
```

Do all exercise work on this branch — don't commit to `feat/STAR-0-backport-azure-pipeline` directly.

## 2. Install

```bash
pnpm install
```

## 3. Point at your own project

```bash
cp qa/tests/playwright/.env.example qa/tests/playwright/.env
```

Set `BASE_URL=<your project's test/staging URL>` — no local Strapi/UI needed. Confirm `/auth/register` loads. Your project's branding/translations may differ from the exercises' reference copy — trust the app, not the doc.

**No `/auth/register` on your project?**

- **Public registration disabled, but sign-in still there** (invite-only accounts): use **Login** instead of Register throughout today's exercises — same steps, same reasoning, different target. You're not starting from zero either: `apps/docs/docs/reference/QA/test-cases/login.md`, `qa/tests/playwright/helpers/pages/SignInPage.ts`, and `qa/tests/playwright/e2e/mock/sign-in.spec.ts` already exist in this repo as worked examples for the base starter's own `/auth/signin` — read them the way Exercise 1 has you read `login.md` anyway, then build your own `LoginPage.ts` and spec against **your** project's actual login page (own path, own copy, own backend errors) — don't assume it matches those files' exact routes/selectors, that's a different deployment.
- **No auth at all on your project** (pure content site, no user accounts): use the facilitator's backup instead — `BASE_URL=https://terapie-v3-pt-stg-31dbd1b8ada1.herokuapp.com`. This one only has Login too (Czech copy, path `/login`, forgot-password at `/reset-password`, no public registration) — treat it exactly like the case above: Login is your flow, build everything from what you actually see there. Do exercises 1, 3, 4, 5, 7 against it; exercises 2, 6, 8 don't care which project you use, keep those on your own.
- **Or skip auth entirely and automate something else on your own project instead** — Register is just this workshop's default example, not a requirement. Anything works as long as it (a) submits to a real backend and (b) has at least one error state worth mocking. Candidates worth checking your project for:
  - **Contact form** (name/email/message) — happy path = smoke, invalid input or a backend rejection = mock
  - **Newsletter / subscribe form** — success vs. "already subscribed" or a rate-limit error
  - **Site search** — real results = smoke, empty results or a backend error = mock
  - **Filtering/sorting a listing** (blog, products, references) — URL params change, mock a broken/empty API response
  - **Cookie consent banner** — accept/reject, then confirm it stays dismissed after a reload
  - **Locale/language switcher** — navigating between locales, checking redirect behavior
  - Any other form or interaction on your site that talks to a real backend and can fail in an interesting way

## 4. Playwright

```bash
pnpm -F @repo/tests-playwright exec playwright install --with-deps
pnpm tests:playwright:e2e:smoke   # sanity check — should pass or fail cleanly, not connection-refused
```

## 5. Docker Desktop

Running — needed once, for Exercise 5's Linux visual baselines.

## 6. Docs site

```bash
pnpm dev:docs   # localhost:3300 — Exercises 1, 3, 8 use it
```

## 7. GitHub

Push access (or fork) with Actions enabled, and your project's `base_url` for Exercise 6.

## 8. Agent skills

Confirm `.claude/skills/write-test-cases`, `write-tests`, `write-qa-notes` exist (`ls .claude/skills/`).

## After the workshop

Commit is optional — this is practice. For feedback, push and open a draft PR against `feat/STAR-0-backport-azure-pipeline` (not `main`):

```bash
git push -u origin test/STAR-0-qa-workshop-<yourname>
```

Delete the branch when done — it's throwaway.

Move on to [01-write-test-case.md](./01-write-test-case.md).
