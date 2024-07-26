"use client"

import { Moon, SunMedium } from "lucide-react"
import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"

import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  removeThisWhenYouNeedMe("ThemeToggle")

  const { setTheme, theme } = useTheme()
  const t = useTranslations()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <SunMedium className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">{t("comps.themeToggle.label")}</span>
    </Button>
  )
}
