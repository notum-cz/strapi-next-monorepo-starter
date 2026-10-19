import { use } from "react"

import { OAuthProvider } from "@/app/[locale]/auth/strapi-oauth/[provider]/_components/OAuthProvider"
import { UseSearchParamsWrapper } from "@/components/helpers/UseSearchParamsWrapper"
import type { ExtendedPageProps } from "@/types/next"

export default function StrapiOAuthCallbackPage(
  props: ExtendedPageProps<"/[locale]/auth/strapi-oauth/[provider]">
) {
  const params = use(props.params)

  return (
    <UseSearchParamsWrapper>
      <OAuthProvider params={params} />
    </UseSearchParamsWrapper>
  )
}
