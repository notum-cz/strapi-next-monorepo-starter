---
sidebar_position: 5
---

# Preview API

Route: `/api/preview`

File:

```txt
apps/ui/src/app/api/preview/route.ts
```

This route is used by Strapi preview links.

It:

1. Validates `secret` against `STRAPI_PREVIEW_SECRET`.
2. Enables or disables Next.js `draftMode()`.
3. Rewrites the `__prerender_bypass` cookie with `sameSite: "none"`.
4. Redirects to the requested localized URL.

The `sameSite: "none"` cookie rewrite is required for Strapi's iframe-embedded preview. Without it, draft mode may silently fall back to published content.

:::warning Secret required
Preview requests return an error unless `STRAPI_PREVIEW_SECRET` is configured and the `secret` query param matches it.
:::

:::tip Draft mode
Draft previews depend on Next.js draft mode cookies. The route adjusts the draft-mode cookie so preview can work inside Strapi's iframe preview flow.
:::

Expected query params:

| Param    | Purpose                                            |
| -------- | -------------------------------------------------- |
| `secret` | Must match `STRAPI_PREVIEW_SECRET`.                |
| `url`    | Page URL to open.                                  |
| `status` | `draft` or `published`; defaults to `published`.   |
| `locale` | Frontend locale; falls back to the default locale. |

Related docs:

- [Strapi Preview](../../strapi/strapi-preview.md)
