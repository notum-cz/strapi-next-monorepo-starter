import fs from "node:fs"
import path from "node:path"

const isRuntimeFile = (name: string) =>
  /\.(js|ts)$/.test(name) && !name.endsWith(".d.ts")

const stripExt = (name: string) => name.slice(0, name.lastIndexOf("."))

/**
 * Generates a Strapi dynamic zone populate map from filesystem structure.
 *
 * Scans all subdirectories located next to this file and loads each module's default export as a populate configuration.
 *
 * The resulting object maps Strapi component UIDs to their populate configs.
 *
 * @returns Record where key = "category.component" and value = populate configuration
 *
 * @example
 * Directory structure:
 * populateDynamicZone/
 *   blocks/hero.ts
 *   blocks/gallery.ts
 *
 * Result:
 * {
 *   "blocks.hero": {...},
 *   "blocks.gallery": {...}
 * }
 *
 * @remarks
 * Prevents sending large populate queries from the frontend.
 * The frontend only requests a dynamic zone and the backend resolves the full populate object automatically.
 */
export const getPopulateDynamicZoneConfig = (): Record<string, unknown> =>
  Object.fromEntries(
    fs
      .readdirSync(__dirname, { withFileTypes: true })
      .filter((dir) => dir.isDirectory())
      .flatMap((dir) => {
        const dirPath = path.join(__dirname, dir.name)
        return fs
          .readdirSync(dirPath)
          .filter(isRuntimeFile)
          .map((file) => {
            const mod = require(path.join(dirPath, file))
            return [`${dir.name}.${stripExt(file)}`, mod.default] as const
          })
      })
  )
