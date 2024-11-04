import { Schema } from "@repo/strapi"

import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"

import { BasicImage, BasicImageProps } from "./BasicImage"
import { LinkStrapi, LinkStrapiProps } from "./LinkStrapi"

interface Props {
  readonly component:
    | Schema.Attribute.ComponentValue<"shared.image-with-link", false>
    | undefined
    | null
  readonly imageProps?: Omit<BasicImageProps, "component">
  readonly linkProps?: Omit<LinkStrapiProps, "component" | "children">
}

export function ImageWithLink({ component, imageProps, linkProps }: Props) {
  removeThisWhenYouNeedMe("ImageWithLink")

  return (
    <LinkStrapi component={component?.link} {...linkProps}>
      <BasicImage component={component?.image} {...imageProps} />
    </LinkStrapi>
  )
}
