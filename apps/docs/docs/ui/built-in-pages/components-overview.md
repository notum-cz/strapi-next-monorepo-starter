# Components Overview

Route: `/dev/components-overview`

Components Overview answers one simple question: **where is each page-builder component used?**

It scans published Strapi pages in the current locale, collects component UIDs from the `content` dynamic zone, and groups pages under each component. This is useful before changing or removing a component because you immediately see which real pages can be affected.

## Why It Is Useful

When a page-builder component changes, the risk is rarely in the component alone. The risk is in the content already using it.

This page gives you a quick impact map:

- Which components are still used.
- Which pages use a given component.
- Which pages QA should check after a component change.

It is also handy after imports or migrations to confirm that expected component UIDs appear in published content.

## Notes

- Only published pages are listed.
- Results are locale-specific.
- Strapi must be reachable and `STRAPI_REST_READONLY_API_KEY` must be configured.
- For visual component examples, use [Components Showcase](./showcase.md).
