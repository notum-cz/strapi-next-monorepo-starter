// Use type safe message keys with `next-intl`
import type { routing } from "@/lib/navigation"

import type messages from "../../locales/en.json"

// https://next-intl.dev/docs/workflows/typescript
declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number]
    Messages: typeof messages
    // In case you want to use useFormatter
    // Formats: typeof formats
  }
}
