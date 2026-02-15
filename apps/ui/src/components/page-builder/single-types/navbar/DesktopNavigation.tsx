import type { Data } from "@repo/strapi-types"

import StrapiLink from "@/components/page-builder/components/utilities/StrapiLink"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/styles"

interface DesktopNavigationProps {
  navbarItems?: Data.ContentType<"api::navbar.navbar">["navbarItems"]
}

export function DesktopNavigation({ navbarItems }: DesktopNavigationProps) {
  if (!navbarItems?.length) return null

  return (
    <NavigationMenu viewport={false} className="hidden lg:flex">
      <NavigationMenuList className="flex items-center gap-2">
        {navbarItems.map((item) => {
          const hasSubItems = !!item.categoryItems?.length

          return (
            <NavigationMenuItem key={item.id} className="relative">
              {/* ===== Trigger / Link ===== */}
              {item.isCategoryLink && item?.link ? (
                <StrapiLink
                  component={item.link}
                  className={cn(
                    navigationMenuTriggerStyle(),
                    "hover:text-brand-salmon px-3 py-2 text-gray-800 transition-colors duration-200"
                  )}
                >
                  {item?.link?.label}
                </StrapiLink>
              ) : hasSubItems ? (
                <NavigationMenuTrigger
                  className={cn(
                    navigationMenuTriggerStyle(),
                    "hover:text-brand-salmon px-3 py-2 text-gray-800 transition-colors duration-200"
                  )}
                >
                  {item.label}
                </NavigationMenuTrigger>
              ) : (
                <span className="hover:text-brand-salmon cursor-default px-3 py-2 font-medium text-gray-800 transition-colors duration-200">
                  {item.label}
                </span>
              )}

              {/* ===== Dropdown ===== */}
              {hasSubItems && (
                <NavigationMenuContent className="z-50">
                  <ul className="min-w-[220px] rounded-lg border border-gray-100 bg-white p-2 shadow-lg">
                    {item?.categoryItems?.map((subItem) => (
                      <li key={subItem.id}>
                        <StrapiLink
                          component={subItem}
                          className="block rounded-md px-4 py-2 text-sm text-gray-700 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-900"
                        />
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              )}
            </NavigationMenuItem>
          )
        })}
      </NavigationMenuList>
    </NavigationMenu>
  )
}
