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
      <SunMedium className="scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      <span className="sr-only">{t("comps.themeToggle.label")}</span>
    </Button>
  )
}
