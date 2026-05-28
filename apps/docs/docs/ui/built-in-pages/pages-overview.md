# Pages Overview

Route: `/dev/pages-overview`

Pages Overview is a compact list of published Strapi pages for the current locale. For each page, it shows the page title, `fullPath`, and the page-builder component UIDs used in its `content` dynamic zone.

It is meant for quick orientation: what pages exist, where they are routed, and what they are built from.

## Why It Is Useful

This page is helpful when you want to inspect content shape without opening Strapi admin.

Common uses:

- Check seeded pages after `pnpm seed:import`.
- Verify `fullPath` values after hierarchy changes.
- See what components a page uses before editing content.
- Pick pages for QA after page-level or routing changes.

The links open the rendered UI pages directly, so it works well as a navigation hub during local development.

## Notes

- Only published pages are listed.
- Results are locale-specific.
- Strapi must be reachable and `STRAPI_REST_READONLY_API_KEY` must be configured.
- For a component-first view, use [Components Overview](./components-overview.md).
