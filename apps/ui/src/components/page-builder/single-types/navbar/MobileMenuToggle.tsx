"use client"

import { Menu, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/styles"

export function MobileMenuToggle({
  open,
  onToggle,
}: {
  open: boolean
  onToggle: () => void
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("lg:hidden", open && "hamburger-menu")}
      aria-label="Toggle menu"
      onClick={onToggle}
    >
      {open ? <X /> : <Menu />}
    </Button>
  )
}
