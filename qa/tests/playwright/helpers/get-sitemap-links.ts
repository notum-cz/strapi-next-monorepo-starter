/* eslint-disable no-console */
import fs from "node:fs"
import path from "node:path"

import GetSitemapLinks from "get-sitemap-links"

export async function fetchSitemap(url: string, format: "--json" | "--txt") {
  try {
    const links = await GetSitemapLinks(url)
    const validLinks = Array.isArray(links) ? links : []

    if (validLinks.length === 0) {
      console.warn(`Sitemap at ${url} is empty or could not be parsed.`)

      return
    }

    if (format === "--json") {
      const filePath = path.join(__dirname, "sites.json")
      fs.writeFileSync(filePath, JSON.stringify(validLinks, null, 2), "utf8")
      console.log(`Wrote ${validLinks.length} links to ${filePath}`)

      return filePath
    }

    if (format === "--txt") {
      const filePath = path.join(__dirname, "sites.txt")
      fs.writeFileSync(filePath, validLinks.join("\n"), "utf8")
      console.log(`Wrote ${validLinks.length} links to ${filePath}`)

      return filePath
    }
  } catch (error) {
    console.error(`Failed to fetch or write sitemap for ${url}:`, error)
    throw error
  }
}
