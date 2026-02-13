import type { Data } from "@repo/strapi-types"

import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"

import { type BasicImageProps, StrapiBasicImage } from "./StrapiBasicImage"
import { type StrapiLinkProps, StrapiLink } from "./StrapiLink"

interface Props {
  readonly component:
    | Data.Component<"utilities.image-with-link">
    | undefined
    | null
  readonly imageProps?: Omit<BasicImageProps, "component">
  readonly linkProps?: Omit<StrapiLinkProps, "component" | "children">
}

export function StrapiImageWithLink({
  component,
  imageProps,
  linkProps,
}: Props) {
  removeThisWhenYouNeedMe("StrapiImageWithLink")

  return (
    <StrapiLink component={component?.link} {...linkProps}>
      <StrapiBasicImage component={component?.image} {...imageProps} />
    </StrapiLink>
  )
}

StrapiImageWithLink.displayName = "StrapiImageWithLink"

export default StrapiImageWithLink
