import { BreadCrumb } from "@/types/api"

import { cn } from "@/lib/styles"
import AppLink from "@/components/elementary/AppLink"

interface Props {
  readonly breadcrumbs?: BreadCrumb[]
  readonly className?: string
}

export function Breadcrumbs({ breadcrumbs, className }: Props) {
  if (!breadcrumbs || breadcrumbs.length === 0) {
    return null
  }

  const isHomepage =
    breadcrumbs.length === 1 &&
    (breadcrumbs[0].fullPath === "/" || breadcrumbs[0].fullPath === "")

  if (isHomepage) {
    return null
  }

  return (
    <nav className={cn("mx-auto w-full py-4", className)}>
      <ol className="flex items-center space-x-2 text-sm text-slate-600 md:text-base">
        {breadcrumbs.map((breadcrumb, index) => (
          <li key={breadcrumb.fullPath} className="flex items-center">
            {index !== 0 && (
              <span className="mx-2 cursor-default text-slate-400">/</span>
            )}

            {index !== breadcrumbs.length - 1 ? (
              <AppLink
                href={breadcrumb.fullPath}
                className="rounded-lg px-2 py-1 text-slate-600 no-underline transition-colors hover:bg-slate-100 hover:text-slate-900 hover:no-underline"
              >
                {breadcrumb.title}
              </AppLink>
            ) : (
              <span className="cursor-default rounded-lg bg-slate-100 px-2 py-1 font-medium text-slate-900">
                {breadcrumb.title}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
