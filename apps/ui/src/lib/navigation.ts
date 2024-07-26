import { createSharedPathnamesNavigation } from "next-intl/navigation"

import { locales } from "./i18n"

// https://next-intl-docs.vercel.app/docs/routing/navigation
export const { Link, redirect, usePathname, useRouter } =
  createSharedPathnamesNavigation({ locales })
