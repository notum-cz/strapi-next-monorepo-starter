import { useTranslations } from "next-intl"

import { AppLink } from "@/types/general"

import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"
import { Link } from "@/lib/navigation"
import { cn } from "@/lib/styles"

export function NavbarItem({ link }: { readonly link: AppLink }) {
  removeThisWhenYouNeedMe("NavbarItem")

  const t = useTranslations()

  const label =
    link.label ?? (link.translateKey != null ? t(link.translateKey) : null)

  return (
    <Link
      href={link.href}
      target={link.target}
      className={cn("text-md flex items-center font-medium hover:text-red-600")}
    >
      {label}
    </Link>
  )
}
