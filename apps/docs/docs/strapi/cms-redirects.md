---
sidebar_position: 5
---

# CMS Redirects

Editors manage URL redirects as content, without code or a redeploy. Redirects live in the **Redirect** collection (`api::redirect.redirect`) and are applied on the frontend by the Next.js [redirects proxy](../ui/next-proxies#redirects).

## The Redirect collection

Each redirect is a published entry with two fields:

| Field         | Description                                                               |
| ------------- | ------------------------------------------------------------------------- |
| `source`      | The incoming path to match, including the locale prefix (e.g. `/en/old`). |
| `destination` | Where to send the visitor — a path on the same site (e.g. `/en/new`).     |

The collection uses Draft & Publish: only **published** redirects are served. Unpublish or delete an entry to stop redirecting.

:::tip Redirects are locale-aware
Both `source` and `destination` carry a locale prefix, so each language variant has its own redirect. `/en/old → /en/new` and `/cs/stara → /cs/nova` are separate entries — a redirect for one locale does not affect another. The same applies to auto-created redirects: changing a page's slug in one locale only produces redirects for that locale.
:::

:::info Always temporary (307)
There is no permanent/301 option by design. The frontend always issues a `307` temporary redirect so an editor can later fix or remove an entry without clients staying pinned to a stale destination. See [Redirects → Temporary by design](../ui/next-proxies#redirects) for the full reasoning.
:::

## How they are applied

The Next.js [redirects proxy](../ui/next-proxies#redirects) matches each incoming request against the published redirect list and issues the redirect before the page renders. Key behaviors handled there:

- Same-origin destinations only; the visitor's query string is preserved.
- Default-locale URLs match with or without the locale prefix.
- Editor typos in `source` (extra spaces, missing or trailing slash) are matched forgivingly.
- The list is cached in-process, so a newly published or edited redirect takes effect within a short TTL (about 2 minutes per running instance) rather than instantly.

## Manually authored redirects

To add a redirect by hand:

1. Create a **Redirect** entry with the `source` path (locale-prefixed) and the `destination`.
2. **Publish** it.
3. The change goes live on the frontend within the proxy cache TTL.

## Automatically created redirects

When a page's `slug` or `parent` changes, its `fullPath` (and its children's) changes too, so the old URLs must redirect to the new ones. The page hierarchy flow creates these `api::redirect.redirect` entries for you, locale-aware, via internal jobs. See [Pages Hierarchy](../page-builder/pages-hierarchy#full-path-generation-and-redirects) for the slug/parent change workflow and how to trigger it.

## Cache revalidation

Publishing a redirect path-revalidates its `source` in the Next.js cache, so a page previously cached at that URL is invalidated and the redirect can take over. See [Cache Revalidation](../reference/cache-revalidation) for the full Strapi → UI invalidation flow.
