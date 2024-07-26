import { errors } from "@strapi/utils"

import validateUniqueParamPerLocale from "../../../../utils/uniquePerLocale"

const { ApplicationError } = errors

const entityName = "api::page.page" as const
const fieldName = "slug" as const

export default {
  async beforeCreate(event) {
    const { data } = event.params
    const result = await validateUniqueParamPerLocale({
      entityName,
      fieldName,
      fieldValue: data.slug,
      locale: data.locale,
    })

    if (!result.isUnique) {
      throw new ApplicationError(
        `This ${fieldName} exists for the given locale`
      )
    }
  },

  async beforeUpdate(event) {
    const { data } = event.params

    if (data.slug) {
      const result = await validateUniqueParamPerLocale({
        entityName,
        fieldName,
        entityParams: { id: data.id },
        fieldValue: data.slug,
      })

      if (!result.isUnique) {
        throw new ApplicationError(
          `This ${fieldName} exists for the given locale`
        )
      }
    }
  },
}
