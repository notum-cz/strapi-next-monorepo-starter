/* eslint-disable jsx-a11y/alt-text */

import Image from "next/image"

import { ImageExtendedProps } from "@/types/next"

const keyStr =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="

const triplet = (e1: number, e2: number, e3: number) =>
  keyStr.charAt(e1 >> 2) +
  keyStr.charAt(((e1 & 3) << 4) | (e2 >> 4)) +
  keyStr.charAt(((e2 & 15) << 2) | (e3 >> 6)) +
  keyStr.charAt(e3 & 63)

const rgbDataURL = (r: number, g: number, b: number) =>
  `data:image/gif;base64,R0lGODlhAQABAPAA${
    triplet(0, r, g) + triplet(b, 255, 255)
  }/yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==`

// More info about the blurEffect check
// https://png-pixel.com

export const ImageWithBlur = ({
  blurRgb = [255, 255, 255],
  ...imgProps
}: ImageExtendedProps & {
  blurRgb?: [number, number, number]
}) => {
  return (
    <Image
      placeholder="blur"
      blurDataURL={rgbDataURL(...blurRgb)}
      {...imgProps}
    />
  )
}
