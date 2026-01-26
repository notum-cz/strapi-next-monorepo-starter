import { use } from "react"

import { UseSearchParamsWrapper } from "@/components/helpers/UseSearchParamsWrapper"
import { OAuthProvider } from "@/app/[locale]/auth/strapi-oauth/[provider]/_components/OAuthProvider"

export default function StrapiOAuthCallbackPage(
  props: PageProps<"/[locale]/auth/strapi-oauth/[provider]">
) {
  const params = use(props.params)
  return (
    <UseSearchParamsWrapper>
      <OAuthProvider params={params} />
    </UseSearchParamsWrapper>
  )
}
