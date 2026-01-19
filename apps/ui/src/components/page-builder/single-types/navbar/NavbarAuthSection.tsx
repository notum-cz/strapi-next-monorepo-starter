"use client"

import { useTranslations } from "next-intl"

import { authClient } from "@/lib/auth-client"
import AppLink from "@/components/elementary/AppLink"
import { LoggedUserMenu } from "@/components/page-builder/single-types/navbar/LoggedUserMenu"

/**
 * Client component for the auth section of the navbar
 * This updates reactively when session changes, unlike server components
 */
export function NavbarAuthSection() {
  const t = useTranslations("navbar")
  const { data: session } = authClient.useSession()

  return (
    <div className="hidden flex-1 items-center justify-end space-x-4 lg:flex">
      {session?.user ? (
        <nav className="flex items-center space-x-1">
          <LoggedUserMenu user={session.user} />
        </nav>
      ) : (
        <AppLink href="/auth/signin">{t("actions.signIn")}</AppLink>
      )}
    </div>
  )
}
