import { StaticImport } from "next/dist/shared/lib/get-img-props"
import { ImageProps } from "next/image"

import { AppLocale } from "./general"

export interface LayoutProps<TParams = {}> {
  children: React.ReactNode
  params: Promise<{ locale: AppLocale } & TParams>
}

export interface PageProps<TParams = {}> {
  params: Promise<{ locale: AppLocale } & TParams>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export type ImageExtendedProps = Omit<ImageProps, "src"> & {
  fallbackSrc?: string
  src: string | StaticImport
}
