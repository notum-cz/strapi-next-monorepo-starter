---
sidebar_position: 13
---

# remove-cache-revalidation

Remove the on-demand cache revalidation feature entirely — the mechanism that refreshes site pages the moment content is published in Strapi, plus the optional CDN purge layer that rides on it. Afterward, pages refresh on their normal time-based schedule instead.

## Use it when

- You don't want Strapi publishes to instantly refresh the site and prefer time-based caching only.

## What it helps solve

- Removes instant page refreshes after CMS changes.
- Simplifies deployments that rely only on normal time-based page updates.
- Removes the related CDN purge example at the same time.

Use [remove-cdn-purge](./remove-cdn-purge.md) if you only want to remove the CDN part.
