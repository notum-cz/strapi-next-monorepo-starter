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
              {item.isCategoryLink && item?.link ? (
                <StrapiLink
                  component={item.link}
                  className={cn(navigationMenuTriggerStyle())}
                >
                  {item?.link?.label}
                </StrapiLink>
              ) : hasSubItems ? (
                <NavigationMenuTrigger
                  className={cn(navigationMenuTriggerStyle())}
                >
                  {item.label}
                </NavigationMenuTrigger>
              ) : (
                <span>{item.label}</span>
              )}

              {/* ===== Dropdown ===== */}
              {hasSubItems && (
                <NavigationMenuContent className="z-50">
                  <ul>
                    {item?.categoryItems?.map((subItem) => (
                      <li key={subItem.id} className="list-none">
                        <StrapiLink component={subItem} />
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
