import { Common, Entity } from "@strapi/strapi"

import { Params } from "../../types"

const validateUniqueParamPerLocale = async <
  TEntityType extends Common.UID.CollectionType,
  TEntityParams extends Params.Pick<
    TEntityType,
    "fields" | "filters"
  >["filters"],
>({
  entityName,
  entityParams,
  fieldName,
  fieldValue,
  locale,
}: {
  entityName: TEntityType
  entityParams?: {
    id?: Entity.ID
  }
  fieldName: keyof TEntityParams
  fieldValue: unknown
  locale?: string
}) => {
  // beforeCreate receives the locale but not the ID
  let searchingLocale = locale

  // beforeUpdate does already have an ID but does not receive locale in the update request
  if (!searchingLocale && entityParams?.id) {
    const entity = await strapi.entityService.findOne(
      entityName,
      entityParams.id,
      {
        // @ts-expect-error locale is not present in every entity
        fields: ["locale", fieldName],
      }
    )

    // @ts-expect-error locale is not present in every entity
    searchingLocale = entity.locale
  }

  if (!searchingLocale) {
    return { isUnique: true }
  }

  const searchResult = await strapi.entityService.findMany(
    entityName,
    // @ts-expect-error locale is not present in every entity TODO: finalize typing
    {
      filters: {
        [fieldName]: { $eq: fieldValue },
        ...(entityParams?.id && { id: { $ne: entityParams.id } }),
      },
      locale: searchingLocale,
    }
  )

  return { isUnique: !Array.isArray(searchResult) || searchResult.length === 0 }
}

export default validateUniqueParamPerLocale
