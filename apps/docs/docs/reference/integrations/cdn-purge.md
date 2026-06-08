---
sidebar_position: 3
---

# CDN Purge (optional)

:::info Scope
Optional, opt-in feature. Cache revalidation works without it — see [Cache Revalidation](../cache-revalidation.md). CDN purge only matters when a CDN sits in front of the Next.js app and you need incident-time eviction faster than the route's TTL.
:::

CDN purge is a pluggable provider, like the optional [Microsoft SSO](../../auth/strapi-admin/microsoft-sso.md) provider. The provider is **inert until configured**: `resolveCdnProvider()` (`apps/ui/src/lib/cdn/index.ts`) returns `null` when no provider's env vars are set, and the **CDN cache** widget on the Strapi homepage reports that no provider is configured.

## Architecture

- Operator uses the **CDN cache** widget → `POST /api/revalidate/cdn-purge` (Strapi controller, admin-token validated)
- Strapi `cdn-cache` service → `POST /api/cdn-purge` (UI route)
- UI route → `purgeCdnCache()` → the resolved `CdnPurgeProvider`

## Adding a provider

Implement a `CdnPurgeProvider` (`apps/ui/src/lib/cdn/types.ts`) in `apps/ui/src/lib/cdn/providers/`, returning `null` from its factory until its env vars are set, then add it to the list in `resolveCdnProvider()`. The first configured provider wins.

## Bundled example: Azure Front Door

`apps/ui/src/lib/cdn/providers/azure-front-door.ts` purges an Azure Front Door endpoint using the Container App's managed identity (IMDS token). It activates only when all of these are set:

| Variable                               | Purpose                                          |
| -------------------------------------- | ------------------------------------------------ |
| `AZURE_SUBSCRIPTION_ID`                | Azure subscription                               |
| `AZURE_RESOURCE_GROUP`                 | Resource group containing the Front Door profile |
| `AZURE_FRONT_DOOR_PROFILE`             | Front Door profile name                          |
| `AZURE_MI_CLIENT_ID`                   | User-assigned managed identity client id         |
| `IDENTITY_ENDPOINT`, `IDENTITY_HEADER` | Injected by the Azure Container App runtime      |

When unset (local dev, non-Azure deploys), the provider is `null` and purge calls return an informative "No CDN provider is configured" outcome.
