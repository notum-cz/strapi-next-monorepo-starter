import { formats } from "@strapi/logger"

// Local dev keeps colors + timestamps for terminal readability. In containers
// we drop both: ANSI codes render as raw escape sequences (e.g. "[32m") in most
// log aggregation backends, and the line timestamp duplicates the backend's own
// ingestion timestamp column.
export default ({ env }: { env: (key: string, def?: string) => string }) => {
  const isDev = env("NODE_ENV", "development") === "development"

  return {
    format: formats.prettyPrint({ colors: isDev, timestamps: isDev }),
  }
}
