# Exercise 3 — SEO: find and interpret a real gap

**Goal:** run SEO against the pages added in Exercise 2 and deal with what it finds — the new pages have a real, undocumented gap.

**Needs:** Exercise 2 done.

## Step 1 — Run it

```bash
pnpm tests:playwright:seo
```

`/` should stay green (page-builder, full metadata). If you're using this workshop's worked example (`/auth/signin`, `/auth/register`), expect a wall of failures on both — it's a real, base-starter gap, so it should reproduce on your project too unless someone's already patched it there. If you added a different page in Exercise 2, whatever it actually returns is your real result — the triage in Steps 3-4 works the same either way.

## Step 2 — Read the failures

Each assertion prints URL, current value, and expectation. For the auth-pages worked example, expect most of these to fail on both:

- **Title** — empty or missing
- **Meta description** — missing
- **Canonical tag** — missing
- **H1 heading** — none found
- **Structured data (JSON-LD)** — none found
- **Open Graph tags** — missing

## Step 3 — Triage: is this a Strapi fix, or a code fix?

This is the actual QA skill here — not reading React source, but knowing where a gap can be closed. For each failing page, check: **does it exist as a Page entry in Strapi?**

- Open Strapi admin → Content Manager → Page, and search for an entry matching the URL.
- **Found an entry** → everything you just saw fail is content, not code. The SEO checks (title, meta description, canonical, robots, Open Graph, Twitter, structured data) map directly to fields on that entry's **SEO** component — fill them in. The H1 comes from the Hero section's title field in that page's content, a different field on the same entry. No developer needed.
- **No entry found** (this is the case for `/auth/register` and `/auth/signin`) → these are hand-built Next.js pages with no corresponding Strapi content at all. There is nothing to edit in the CMS — the gap is in the codebase, full stop.

## Step 4 — Act on the triage

- **If it was Strapi-editable:** fix it in the entry, save, then re-run `pnpm tests:playwright:seo` and confirm the page now passes. Done — no dev involvement needed.
- **If it was code-owned** (our auth pages): don't touch app code today. Write it up as a follow-up ticket for the dev team, formatted like you would in your real tracker (Jira/Linear/GitHub Issues) — title, the affected pages, exactly which checks failed, and the one line that saves them an investigation: _"no Strapi Page entry exists for these routes, this isn't a missing CMS field."_ Also add a short `write-qa-notes` entry (`apps/docs/docs/reference/QA/common-knowledge/index.md`) so the next person who runs into this doesn't have to redo the triage from scratch.

## Checkpoint

For each of your failing checks, say which bucket it landed in — Strapi-editable or code-owned — and what you actually did about it (fixed the entry vs. filed a ticket).

Move on to [04-axe.md](./04-axe.md).
