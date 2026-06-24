---
sidebar_position: 14
---

# remove-cdn-purge

Remove just the optional CDN cache-clearing example while keeping on-demand page refreshes working.

## Use it when

- You use on-demand revalidation but don't need the CDN cache-eviction example.

## What it helps solve

- Removes the CDN cache-clearing example when your project does not need it.
- Keeps normal on-demand page refreshes after CMS changes.
- Reduces cloud-specific setup for projects not using Azure Front Door.

Use [remove-cache-revalidation](./remove-cache-revalidation.md) if you want to remove the whole refresh feature.
