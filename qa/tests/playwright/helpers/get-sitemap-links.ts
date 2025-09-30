import fs from "fs"
import path from "path"

import GetSitemapLinks from "get-sitemap-links"

export async function fetchSitemap(url: string, format: "--json" | "--txt") {
  const links = await GetSitemapLinks(url)

  if (format === "--json") {
    const filePath = path.join(__dirname, "sites.json")
    fs.writeFileSync(filePath, JSON.stringify(links, null, 2), "utf-8")
    console.log(`Wrote ${links.length} links to ${filePath}`)
    return filePath
  }

  if (format === "--txt") {
    const filePath = path.join(__dirname, "sites.txt")
    fs.writeFileSync(filePath, links.join("\n"), "utf-8")
    console.log(`Wrote ${links.length} links to ${filePath}`)
    return filePath
  }
}
