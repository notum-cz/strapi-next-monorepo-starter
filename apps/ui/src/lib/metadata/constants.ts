// Constant used to map `seo.metaRobots` values from Strapi to Next.js compatible format (In Strapi stored in enum in seo component)
export const metaRobots: Record<
  string,
  Record<string, boolean | number | string>
> = {
  all: {
    index: true,
    follow: true,
  },
  index: {
    index: true,
  },
  "index,follow": {
    index: true,
    follow: true,
  },
  noindex: {
    index: false,
  },
  "noindex,follow": {
    index: false,
    follow: true,
  },
  "noindex,nofollow": {
    index: false,
    follow: false,
  },
  none: {},
  noarchive: {
    noarchive: true,
  },
  nosnippet: {
    nosnippet: true,
  },
  "max-snippet": {
    "max-snippet": 1,
  },
}
