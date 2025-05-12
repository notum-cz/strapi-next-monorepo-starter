import { UID } from "@strapi/strapi"

export type StrapiPreviewConfig = {
  enabled: boolean
  previewSecret?: string
  clientUrl?: string
  enabledContentTypeUids: Array<UID.CollectionType>
}
