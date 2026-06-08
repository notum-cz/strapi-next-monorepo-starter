---
sidebar_position: 3
---

# CDN

:::info Scope
Optional, opt-in feature. Cache revalidation works without it — see [Cache Revalidation](../cache-revalidation). This CDN integration is used for purging cached CDN entries when a CDN sits in front of the Next.js app and operators need incident-time eviction faster than the route's TTL.
:::

CDN cache purging uses a pluggable provider model. The integration is **inert until configured**: `resolveCdnProvider()` (`apps/ui/src/lib/cdn/index.ts`) returns `null` when no provider's environment variables are set, and the **CDN cache** widget on the Strapi homepage reports that no provider is configured.

## CDN Purge Flow

- Operator uses the **CDN cache** widget and chooses specific URLs or the entire website
- Strapi sends the selected URL list, or `/*` for the entire website, to `POST /api/cdn-purge` on the UI
- UI route → `purgeCdnCache()` → the resolved `CdnPurgeProvider`

### Azure Front Door

`apps/ui/src/lib/cdn/providers/azure-front-door.ts` purges an Azure Front Door endpoint using the Container App's managed identity (IMDS token). It activates only when all of these are set:

:::caution Purge propagation
Azure Front Door cache purge can take up to 20 minutes to propagate globally. Because that is often slower than the normal Next.js revalidation window, automatic CDN purge is intentionally not part of the Strapi publish flow. See the [Azure Front Door FAQ](https://learn.microsoft.com/en-us/azure/frontdoor/front-door-faq#how-long-does-it-take-to-purge-content-from-azure-front-door) for Microsoft's propagation guidance.
:::

| Variable                               | Purpose                                          |
| -------------------------------------- | ------------------------------------------------ |
| `AZURE_SUBSCRIPTION_ID`                | Azure subscription                               |
| `AZURE_RESOURCE_GROUP`                 | Resource group containing the Front Door profile |
| `AZURE_FRONT_DOOR_PROFILE`             | Front Door profile name                          |
| `AZURE_MI_CLIENT_ID`                   | User-assigned managed identity client id         |
| `IDENTITY_ENDPOINT`, `IDENTITY_HEADER` | Injected by the Azure Container App runtime      |

When unset (local dev, non-Azure deploys), the provider is `null` and purge calls return an informative "No CDN provider is configured" outcome.
