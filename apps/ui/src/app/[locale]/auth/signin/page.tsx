import { Locale } from "next-intl"
import { setRequestLocale } from "next-intl/server"

import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"
import { getStrapiUrl } from "@/lib/urls"

import { SignInForm } from "./_components/SignInForm"

export default async function SignInPage({
  params,
}: PageProps<"/[locale]/auth/signin">) {
  removeThisWhenYouNeedMe("SignInPage")

  const { locale } = (await params) as { locale: Locale }

  setRequestLocale(locale)

  return <SignInForm strapiUrl={getStrapiUrl()} />
}
