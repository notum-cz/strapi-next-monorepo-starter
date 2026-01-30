/**
 * Simple breadcrumbs component override for games
 * Can be extended from existing Breadcrumbs component
 */

"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/styles"

interface BreadcrumbItem {
  label: string
  href?: string
  isCurrent?: boolean
}

interface SimpleBreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export function SimpleBreadcrumbs({ items, className }: SimpleBreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center gap-2", className)}>
      <ol className="flex items-center gap-2 text-sm">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            {item.isCurrent ? (
              <span className="text-slate-600 font-medium">{item.label}</span>
            ) : item.href ? (
              <>
                <Link
                  href={item.href}
                  className="text-blue-600 hover:text-blue-700 hover:underline"
                >
                  {item.label}
                </Link>
                {index < items.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </>
            ) : (
              <>
                <span className="text-slate-600">{item.label}</span>
                {index < items.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export default SimpleBreadcrumbs
