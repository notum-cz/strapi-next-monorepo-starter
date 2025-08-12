import { Data } from "@repo/strapi"

import { cn } from "@/lib/styles"
import AppLink from "@/components/elementary/AppLink"

interface StrapiNavLinkProps {
  readonly component: Data.Component<"utilities.link">
  readonly className?: string
}

export function StrapiNavLink({ component, className }: StrapiNavLinkProps) {
  if (!component?.href || !component?.label) {
    return null
  }

  return (
    <AppLink
      href={component.href}
      variant="ghost"
      className={cn(
        "mx-2 rounded-md px-4 py-3 text-base font-medium transition-all duration-200",
        "border border-[var(--color-brand-red-20)] bg-transparent text-[var(--color-brand-red)]",
        "hover:border-[var(--color-brand-red-30)] hover:bg-[var(--color-brand-red)] hover:text-white",
        "focus:ring-2 focus:ring-[var(--color-brand-red-10)] focus:outline-none",
        className
      )}
    >
      {component.label}
    </AppLink>
  )
}

export default StrapiNavLink
