/**
 * This script reads the theme.css, finds all the color and font size variables, and extracts them into a JSON array
 *
 * This array is the imported in Strapi
 */
const path = require("path")
const fs = require("fs")

// Read the Tailwind Theme CSS file
const inputPath = path.resolve(__dirname, "./theme.css")
let css = fs.readFileSync(inputPath, "utf8")

/**
 * Read all color vars and writes it into CkEditor format json file
 *
 * Reads lines that start with `--color-`
 *  */

const colorOutputJsonPath = path.resolve(
  __dirname,
  "../dist/ckeditor-color-config.json"
)
const colorVars = []
const colorVarRegex = /(--color-[\w-]+)\s*:\s*([^;]+);/g

let colorMatch
while ((colorMatch = colorVarRegex.exec(css)) !== null) {
  const [, varName] = colorMatch
  colorVars.push({
    color: `var(${varName})`,
    label: varName.replaceAll(/--/g, ""),
  })
}

/**
 * Read all font size vars and writes it into CkEditor format json file
 *
 * Reads lines that start with `--text-`
 *
 * Unfortunately CkEditor does not support CSS variables as typography sizes, so we need to export pixels here
 *  */
const fontSizeOutputJsonPath = path.resolve(
  __dirname,
  "../dist/ckeditor-fontSize-config.json"
)
const fontSizeVars = []
const fontSizeVarRegex = /(--text-[\w-]+)\s*:\s*([^;]+);/g

let fontSizeMatch
while ((fontSizeMatch = fontSizeVarRegex.exec(css)) !== null) {
  const [, varName, varValue] = fontSizeMatch
  fontSizeVars.push({
    model: `${varValue}`,
    title: varName.replaceAll(/--/g, ""),
  })
}

fs.writeFileSync(
  colorOutputJsonPath,
  JSON.stringify(colorVars, null, 2),
  "utf8"
)
fs.writeFileSync(
  fontSizeOutputJsonPath,
  JSON.stringify(fontSizeVars, null, 2),
  "utf8"
)
