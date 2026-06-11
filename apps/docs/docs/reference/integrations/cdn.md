---
sidebar_position: 3
---

# CDN

When a CDN sits in front of the Next.js app, two things are in play. The CDN reuses cached responses according to the HTTP cache headers the UI emits (automatic), and operators can force entries out of the CDN ahead of those headers through the optional purge integration.

## Cache Headers

A CDN in front of the Next.js app does not need its own cache policy: it reuses each response for as long as the HTTP cache headers Next.js emits allow. Those headers are derived from the page route's `revalidate` (ISR) interval, so the CDN inherits the same freshness window the UI already defines. See [Caching → Full Route Cache and ISR](../../ui/caching#full-route-cache-and-isr) for how the UI sets `revalidate` and the headers it produces.

Because the CDN follows those headers, routine content updates do not require a purge — the header-driven TTL and the [Cache Revalidation](../cache-revalidation) pipeline already refresh content.

## CDN Purge Flow

:::info Optional, opt-in
Cache revalidation works without this — see [Cache Revalidation](../cache-revalidation). Purge exists only for incident-time eviction: forcing entries out of the CDN faster than their headers would expire on their own.
:::

CDN cache purging uses a pluggable provider model. The integration is **inert until configured**: `resolveCdnProvider()` (`apps/ui/src/lib/cdn/index.ts`) returns `null` when no provider's environment variables are set, and the **CDN cache** widget on the Strapi homepage reports that no provider is configured.

- Operator uses the **CDN cache** widget and chooses specific URLs or the entire website
- Strapi sends the selected URL list, or `/*` for the entire website, to `POST /api/cdn-purge` on the UI
- UI route → `purgeCdnCache()` → the resolved `CdnPurgeProvider`

Strapi authenticates the call with an `Authorization: Bearer <STRAPI_CDN_PURGE_SECRET>` header (verified with a constant-time comparison before the body is read). The secret must match in `apps/strapi` and `apps/ui`. The endpoint rejects unauthenticated calls regardless of whether a CDN provider is configured.

![CDN cache widget in the Strapi homepage](/img/cdn-purge-widget.png)

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
