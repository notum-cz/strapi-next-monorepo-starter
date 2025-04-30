import { LogOut, User } from "lucide-react"
import { Session } from "next-auth"
import { useTranslations } from "next-intl"

import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"
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
  removeThisWhenYouNeedMe("LoggedUserMenu")

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
          <Link href="/auth/signout" className="flex w-full items-center gap-1">
            <LogOut className="mr-2 size-4" />
            <span>{t("actions.signOut")}</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
