/**
 * build-ck-config.js
 *
 * This script processes the generated CSS from the design system (styles.css) to extract CSS custom properties (variables)
 * and outputs configuration files for CKEditor integration. It is intended to be run after the design system build step,
 * when the CSS is available in the package's dist directory.
 *
 * Main functionalities:
 * 1. Reads the compiled styles.css file and extracts all CSS variables.
 * 2. Generates a color configuration JSON file (ckeditor-color-config.json) for CKEditor, containing all color variables.
 * 3. Generates a font size configuration JSON file (ckeditor-fontSize-config.json) for CKEditor, containing all font size variables.
 * 4. Outputs a theme CSS string (styles-strapi.json) that sets all variables on the .ck class, for use in CKEditor themes.
 *
 * Output files (all in ../../dist/):
 *   - ckeditor-color-config.json: Array of color variable objects for CKEditor color plugin.
 *   - ckeditor-fontSize-config.json: Array of font size variable objects for CKEditor font size plugin.
 *   - styles-strapi.json: String of CSS to apply all variables to the .ck class, plus the full custom styles CSS.
 *
 */
const fs = require("node:fs")
const path = require("node:path")

const postcss = require("postcss")

const customStylesInputPath = path.resolve(__dirname, "../../dist/styles.css")
const customStyles = postcss.parse(
  fs.readFileSync(customStylesInputPath, "utf8")
)
// Strapi's CSS import bundles font URLs. JSON-injected CSS cannot resolve them.
customStyles.walkAtRules("font-face", (rule) => rule.remove())
const customStylesCssContent = customStyles.toString()

const colorOutputJsonPath = path.resolve(
  __dirname,
  "../../dist/ckeditor-color-config.json"
)
const fontSizeOutputJsonPath = path.resolve(
  __dirname,
  "../../dist/ckeditor-fontSize-config.json"
)

const textSizeVarRegex = /^--text-\w+$/
const spacingVarRegex = /^--spacing(?:-[\w-]+)?$/

const remToPx = (value) => {
  const remValue = value.trim().match(/^(-?(?:\d+(?:\.\d+)?|\.\d+))rem$/)

  if (!remValue) {
    return value
  }

  // Match the frontend's 16px root size independently of Strapi's root size.
  return `${Number(remValue[1]) * 16}px`
}

const getStrapiVarValue = ({ name, value }) => {
  if (textSizeVarRegex.test(name) || spacingVarRegex.test(name)) {
    return remToPx(value)
  }

  return value
}

// First collect all CSS variables
const allVars = []
// eslint-disable-next-line sonarjs/slow-regex
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
    label: v.name.replaceAll("--", ""),
  }))

const fontSizeVars = allVars
  .filter((v) => textSizeVarRegex.test(v.name))
  .map((v) => ({
    model: getStrapiVarValue(v),
    title: v.name.replaceAll("--", ""),
  }))

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

const themeCssFilePath = path.resolve(
  __dirname,
  "../../dist/styles-strapi.json"
)
fs.writeFileSync(
  themeCssFilePath,
  JSON.stringify(
    `.ck { ${allVars.map((v) => `${v.name}: ${getStrapiVarValue(v)};`).join("\n")} } \n ${customStylesCssContent}`,
    null,
    2
  ),
  "utf8"
)
