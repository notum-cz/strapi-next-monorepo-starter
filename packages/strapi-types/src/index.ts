import type {
  WithSmartPopulate,
  WithSmartPopulateResult,
  WithSmartPopulateResultParams,
} from "@notum-cz/strapi-plugin-smart-populate/types"
import type { Data, Modules, Schema, UID } from "@strapi/strapi"

// Re-export useful namespaces and types
export type { Data, Modules, Schema, UID } from "@strapi/strapi"
export type ID = Modules.Documents.ID

// Re-export document engine service function types
export type FindMany<TContentTypeUID extends UID.ContentType> =
  WithSmartPopulate<
    Modules.Documents.ServiceParams<TContentTypeUID>["findMany"]
  >

export type FindFirst<TContentTypeUID extends UID.ContentType> =
  WithSmartPopulate<
    Modules.Documents.ServiceParams<TContentTypeUID>["findFirst"]
  >

export type FindOne<TContentTypeUID extends UID.ContentType> =
  WithSmartPopulate<Modules.Documents.ServiceParams<TContentTypeUID>["findOne"]>

// Re-export generated types (components and content types)
export * from "../generated/components"
export * from "../generated/contentTypes"

// Re-export original Result type
// We should not import from "@strapi/types" directly, see
// https://docs.strapi.io/cms/typescript/development#fix-build-issues-with-the-generated-types
// // export type { Result } from "@strapi/types/dist/modules/documents"
export type Result<
  TUID extends UID.ContentType,
  TParams extends { populate?: unknown } = never,
> = WithSmartPopulateResult<
  Modules.Documents.Result<
    TUID,
    WithSmartPopulateResultParams<
      TParams,
      Modules.Documents.Params.Pick<TUID, "fields" | "populate">
    >
  >,
  TParams,
  {
    contentType: Data.ContentType<TUID>
    populatableKeys: Extract<
      Schema.PopulatableAttributeNames<TUID>,
      keyof Data.ContentType<TUID>
    >
  }
>
