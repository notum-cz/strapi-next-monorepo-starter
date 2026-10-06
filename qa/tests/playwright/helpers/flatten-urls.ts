type UrlTree = string | UrlTree[] | { [key: string]: UrlTree }

/**
 * Recursively collects every string leaf from urls.json, however deeply it's
 * nested (env, brand, region, ...), and dedupes the result.
 */
export function flattenUrls(node: UrlTree): string[] {
  if (typeof node === "string") return [node]
  if (Array.isArray(node)) return node.flatMap(flattenUrls)

  return Array.from(new Set(Object.values(node).flatMap(flattenUrls)))
}
