import { StaticImport } from "next/dist/shared/lib/get-img-props"
import { ImageProps } from "next/image"

export type ImageExtendedProps = Omit<ImageProps, "src"> & {
  fallbackSrc?: string
  src: string | StaticImport
}
