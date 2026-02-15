"use client"

import { Menu, X } from "lucide-react"

import { cn } from "@/lib/styles"
import { Button } from "@/components/ui/button"

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
