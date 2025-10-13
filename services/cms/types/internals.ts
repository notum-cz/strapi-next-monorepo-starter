import { Model } from "@strapi/database"
import { UID } from "@strapi/strapi"

export type StrapiPreviewConfig = {
  enabled: boolean
  previewSecret?: string
  clientUrl?: string
  enabledContentTypeUids: Array<UID.CollectionType>
}

export type LifecycleEventType<T extends keyof Model["lifecycles"]> =
  Parameters<Model["lifecycles"][T]>[0]
