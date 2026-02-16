import { LogOutIcon, User, UserRoundCogIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Link } from "@/lib/navigation"
import type { BetterAuthUserWithStrapi } from "@/types/better-auth"

export function LoggedUserMenu({
  user,
}: {
  readonly user: BetterAuthUserWithStrapi
}) {
  const t = useTranslations("navbar")

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <User className="mr-2 size-4" />
          {user.email}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>{t("account")}</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Only show change password for email/password users (not OAuth) */}
        {(!user.provider || user.provider === "credentials") && (
          <DropdownMenuItem>
            <Link
              href="/auth/change-password"
              className="flex w-full items-center gap-1"
            >
              <UserRoundCogIcon className="mr-2 size-4" />
              <span>{t("actions.changePassword")}</span>
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem>
          <Link href="/auth/signout" className="flex w-full items-center gap-1">
            <LogOutIcon className="mr-2 size-4" />
            <span>{t("actions.signOut")}</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
