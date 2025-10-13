import { LogOutIcon, User, UserRoundCogIcon } from "lucide-react"
import { Session } from "next-auth"
import { useTranslations } from "next-intl"

import { Link } from "@/lib/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function LoggedUserMenu({ user }: { readonly user: Session["user"] }) {
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

        <DropdownMenuItem>
          <Link
            href="/auth/change-password"
            className="flex w-full items-center gap-1"
          >
            <UserRoundCogIcon className="mr-2 size-4" />
            <span>{t("actions.changePassword")}</span>
          </Link>
        </DropdownMenuItem>

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
