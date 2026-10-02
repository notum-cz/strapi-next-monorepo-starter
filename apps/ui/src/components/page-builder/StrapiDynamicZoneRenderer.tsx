import type { Data } from "@repo/strapi-types"

import { ErrorBoundary } from "@/components/elementary/ErrorBoundary"
import { PageContentComponents } from "@/components/page-builder"
import { logger } from "@/lib/logging"
import type { PageBuilderComponentProps } from "@/types/general"

type Props = Omit<PageBuilderComponentProps, "pageParams"> & {
  readonly params: NonNullable<PageBuilderComponentProps["pageParams"]>
  readonly dynamicZone: Data.ContentType<"api::page.page">["content"]
}

export function StrapiDynamicZoneRenderer({
  dynamicZone,
  page,
  params,
  searchParams,
}: Props) {
  const anchorOccurrences = new Map<string, number>()

  return (
    <>
      {dynamicZone
        ?.filter((comp) => comp != null)
        .map((comp) => {
          const name = comp.__component
          const id = comp.id
          const key = `${name}-${id}`
          const componentName = name.slice(name.indexOf(".") + 1)
          const occurrence = (anchorOccurrences.get(componentName) ?? 0) + 1
          anchorOccurrences.set(componentName, occurrence)
          const anchorId = `a-${componentName}${occurrence > 1 ? `-${occurrence}` : ""}`
          const Component = PageContentComponents[name]
          if (Component == null) {
            logger.warn("Unknown page-builder component", { name, id })

            return (
              <div key={key} className="font-medium text-red-500">
                Component &quot;{key}&quot; is not implemented on the frontend.
              </div>
            )
          }

          return (
            <ErrorBoundary key={key}>
              <div id={anchorId} className="mb-20 md:mb-32 lg:mb-40">
                <Component
                  component={comp}
                  pageParams={params}
                  page={page}
                  searchParams={searchParams}
                />
              </div>
            </ErrorBoundary>
          )
        })}
    </>
  )
}
