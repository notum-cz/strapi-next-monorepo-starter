import { getEnvVariableValue } from "@/lib/general-helpers"

export const DEBUG_STRAPI_CLIENT_API_CALLS = getEnvVariableValue(
  "DEBUG_STRAPI_CLIENT_API_CALLS"
)
