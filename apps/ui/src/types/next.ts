import type { StaticImport } from "next/dist/shared/lib/get-img-props"
import type { ImageProps } from "next/image"
import type { Locale } from "next-intl"

import type { AppRoutes } from "../../.next/types/routes"

type SearchParams = Record<string, string | string[] | undefined>

// These types do not replace runtime validation of URL values.
export interface ExtendedPageProps<
  T extends AppRoutes,
  TSearchParams extends SearchParams = SearchParams,
> extends PageProps<T> {
  params: Promise<Awaited<PageProps<T>["params"]> & { locale: Locale }>
  searchParams: Promise<Awaited<PageProps<T>["searchParams"]> & TSearchParams>
}

export type ImageExtendedProps = Omit<ImageProps, "src"> & {
  fallbackSrc?: string
  src: string | StaticImport
}
