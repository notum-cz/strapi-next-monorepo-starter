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

  return (
    <div className={cn("max-w-screen-default mx-auto w-full", className)}>
      <div>
        {breadcrumbs.map((breadcrumb, index) => (
          <span key={breadcrumb.fullPath}>
            {index !== 0 && (
              <span className={cn("mx-2 inline-block text-black")}>/</span>
            )}

            {index !== breadcrumbs.length - 1 ? (
              <AppLink href={breadcrumb.fullPath} className="p-0">
                <span
                  className={cn(
                    "tracking-sm inline-block text-xs leading-[18px] text-black md:text-sm md:leading-[21px]"
                  )}
                >
                  {breadcrumb.title}
                </span>
              </AppLink>
            ) : (
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
            )}
          </span>
        ))}
      </div>
    </div>
  )
}
