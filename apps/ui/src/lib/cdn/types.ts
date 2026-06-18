/**
 * Result of a CDN purge attempt. `ok: false` carries a human-readable
 * `reason` that Strapi surfaces to the editor in the purge widget.
 */
export type CdnPurgeOutcome = {
  ok: boolean
  reason?: string
}

/**
 * A pluggable CDN purge provider. Implement one of these per CDN and register
 * it in `resolveCdnProvider()`. Azure Front Door ships as the example provider.
 */
export type CdnPurgeProvider = {
  name: string
  purge: (paths: string[]) => Promise<CdnPurgeOutcome>
}
