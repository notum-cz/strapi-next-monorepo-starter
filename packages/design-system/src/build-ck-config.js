/**
 * build-ck-config.js
 *
 * This script processes the generated CSS from the design system (styles.css) to extract CSS custom properties (variables)
 * and outputs configuration files for CKEditor integration. It is intended to be run after the design system build step,
 * when the CSS is available in the ../dist directory.
 *
 * Main functionalities:
 * 1. Reads the compiled styles.css file and extracts all CSS variables.
 * 2. Generates a color configuration JSON file (ckeditor-color-config.json) for CKEditor, containing all color variables.
 * 3. Generates a font size configuration JSON file (ckeditor-fontSize-config.json) for CKEditor, containing all font size variables.
 * 4. Outputs a theme CSS string (styles-strapi.json) that sets all variables on the .ck class, for use in CKEditor themes.
 *
 * Output files (all in ../dist/):
 *   - ckeditor-color-config.json: Array of color variable objects for CKEditor color plugin.
 *   - ckeditor-fontSize-config.json: Array of font size variable objects for CKEditor font size plugin.
 *   - styles-strapi.json: String of CSS to apply all variables to the .ck class, plus the full custom styles CSS.
 *
 */
const path = require("path")
const fs = require("fs")

const customStylesInputPath = path.resolve(__dirname, "../dist/styles.css")
let customStylesCssContent = fs.readFileSync(customStylesInputPath, "utf8")

const colorOutputJsonPath = path.resolve(
  __dirname,
  "../dist/ckeditor-color-config.json"
)
const fontSizeOutputJsonPath = path.resolve(
  __dirname,
  "../dist/ckeditor-fontSize-config.json"
)

// First collect all CSS variables
const allVars = []
const allVarRegex = /(--[\w-]+)\s*:\s*([^;]+);/g

let match
while ((match = allVarRegex.exec(customStylesCssContent)) !== null) {
  const [, varName, varValue] = match
  allVars.push({ name: varName, value: varValue })
}

// Process variables for different categories
const colorVars = allVars
  .filter((v) => v.name.startsWith("--color-"))
  .map((v) => ({
    color: `var(${v.name})`,
    label: v.name.replaceAll(/--/g, ""),
  }))

const fontSizeVars = allVars
  .filter((v) => /^--text-\w+(?!.*--)$/.test(v.name))
  .map((v) => ({ model: `${v.value}`, title: v.name.replaceAll(/--/g, "") }))

// Write output files
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

const themeCssFilePath = path.resolve(__dirname, "../dist/styles-strapi.json")
fs.writeFileSync(
  themeCssFilePath,
  JSON.stringify(
    `.ck { ${allVars.map((v) => `${v.name}: ${v.value};`).join("\n")} } \n ${customStylesCssContent}`,
    null,
    2
  ),
  "utf8"
)
