import { Data } from "@repo/strapi"

import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"

import { BasicImage, BasicImageProps } from "./BasicImage"
import { StrapiLink, StrapiLinkProps } from "./StrapiLink"

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
      <BasicImage component={component?.image} {...imageProps} />
    </StrapiLink>
  )
}

export default StrapiImageWithLink
