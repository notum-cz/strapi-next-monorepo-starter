export const processLinkHrefAttribute = (href: string, locale: string) =>
  `/${locale}${href.startsWith("/") ? "" : "/"}${href}`
