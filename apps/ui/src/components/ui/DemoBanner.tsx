import { ExternalLink } from "lucide-react"
import { useTranslations } from "next-intl"

export function DemoBanner() {
  const t = useTranslations("demoBanner")

  return (
    <div className="bg-primary text-primary-foreground relative z-50 flex flex-col items-center justify-between px-4 py-2 text-sm md:flex-row">
      <div className="mb-2 flex items-center gap-2 md:mb-0">
        <span className="font-bold whitespace-nowrap">{t("liveDemo")}</span>
        <span className="hidden md:inline">{t("description")}</span>
      </div>
      <div className="flex items-center gap-4">
        <a
          href="https://strapinextjs.docs.notum.tech/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 whitespace-nowrap hover:underline"
        >
          {t("landingPage")} <ExternalLink className="h-3 w-3" />
        </a>
        <a
          href="https://strapinextjs.docs.notum.tech/docs/category/getting-started"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 whitespace-nowrap hover:underline"
        >
          {t("documentation")} <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  )
}
