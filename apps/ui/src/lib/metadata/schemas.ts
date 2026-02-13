import type { Locale } from "next-intl"

import { createPublicFullPath } from "@/lib/navigation"
import type { BreadCrumb } from "@/types/api"

export function generateBreadcrumbListSchema(
  breadcrumbs: BreadCrumb[],
  locale: Locale
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((breadcrumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: breadcrumb.title,
      item: breadcrumb.fullPath.startsWith("http")
        ? breadcrumb.fullPath
        : createPublicFullPath(breadcrumb.fullPath, locale),
    })),
  }
}
