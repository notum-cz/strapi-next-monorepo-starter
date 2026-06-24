import { normalizeCachePath } from "@repo/shared-data"

import { routing } from "@/lib/navigation"

const defaultLocaleRoot = `/${routing.defaultLocale}`

/**
 * Adds both default-locale-prefixed and unprefixed variants for paths that
 * are about to be invalidated in Next.js or Front Door.
 */
export function addDefaultLocalePathVariants(
  paths: Set<string>,
  rawPaths: Iterable<string>
) {
  for (const rawPath of rawPaths) {
    const path = normalizeCachePath(rawPath)

    if (path === "/*") {
      paths.add(path)
      continue
    }

    paths.add(withDefaultLocale(path))
    paths.add(withoutDefaultLocale(path))
  }
}

/**
 * Adds the default locale prefix unless the path already has it.
 */
function withDefaultLocale(path: string): string {
  if (path === defaultLocaleRoot) {
    return path
  }

  if (path === "/") {
    return defaultLocaleRoot
  }

  if (path.startsWith(`${defaultLocaleRoot}/`)) {
    return path
  }

  return `${defaultLocaleRoot}${path}`
}

/**
 * Removes the default locale prefix so equivalent paths dedupe in the queue.
 */
function withoutDefaultLocale(path: string): string {
  if (path === defaultLocaleRoot || path === `${defaultLocaleRoot}/`) {
    return "/"
  }

  if (path.startsWith(`${defaultLocaleRoot}/`)) {
    return normalizeCachePath(path.slice(defaultLocaleRoot.length))
  }

  return path
}
