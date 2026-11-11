import { setRequestLocale } from "next-intl/server"

import { getEnvVar } from "@/lib/env-vars"
import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"
import type { ExtendedPageProps } from "@/types/next"

import { SignInForm } from "./_components/SignInForm"

export default async function SignInPage({
  params,
}: ExtendedPageProps<"/[locale]/auth/signin">) {
  removeThisWhenYouNeedMe("SignInPage")

  const { locale } = await params

  setRequestLocale(locale)

  return <SignInForm strapiUrl={getEnvVar("STRAPI_URL")} />
}
