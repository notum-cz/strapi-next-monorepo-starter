import type { Locale } from "next-intl"

import AppLink from "@/components/elementary/AppLink"
import StrapiStructuredData from "@/components/page-builder/components/seo-utilities/StrapiStructuredData"
import { generateBreadcrumbListSchema } from "@/lib/metadata/schemas"
import { cn } from "@/lib/styles"
import type { BreadCrumb } from "@/types/api"

interface Props {
  readonly breadcrumbs?: BreadCrumb[]
  readonly className?: string
  readonly locale: Locale
}

export function Breadcrumbs({ breadcrumbs, className, locale }: Props) {
  if (!breadcrumbs || breadcrumbs.length === 0) {
    return null
  }

  const breadcrumbListSchema = generateBreadcrumbListSchema(breadcrumbs, locale)

  return (
    <div className={cn("max-w-screen-default mx-auto w-full", className)}>
      <StrapiStructuredData structuredData={breadcrumbListSchema} />
      <div>
        {breadcrumbs.map((breadcrumb, index) => (
          <span key={breadcrumb.fullPath}>
            {index !== 0 && (
              <span className={cn("mx-2 inline-block text-black")}>/</span>
            )}

            {index === breadcrumbs.length - 1 ? (
              <span
                className={cn(
                  "tracking-sm inline-block text-xs leading-[18px] break-words text-black md:text-sm md:leading-[21px]"
                )}
                style={{
                  wordBreak: "break-word",
                  overflowWrap: "break-word",
                  display: "inline",
                }}
              >
                {breadcrumb.title}
              </span>
            ) : (
              <AppLink href={breadcrumb.fullPath} className="p-0">
                <span
                  className={cn(
                    "tracking-sm inline-block text-xs leading-[18px] text-black md:text-sm md:leading-[21px]"
                  )}
                >
                  {breadcrumb.title}
                </span>
              </AppLink>
            )}
          </span>
        ))}
      </div>
    </div>
  )
}
