/**
 * build-tiptap-config.js
 *
 * Generates TipTap editor configuration files from the design system theme:
 *   - tiptap-color-config.json: Array of color objects with human-readable labels
 *   - tiptap-theme.css: Plain CSS with all theme variables on :root {}
 */
const fs = require("node:fs")
const path = require("node:path")

// --- tiptap-color-config.json ---

const stylesPath = path.resolve(__dirname, "../dist/styles.css")
const stylesCss = fs.readFileSync(stylesPath, "utf8")

// This is only running during buildtime and depends on the theme.
// eslint-disable-next-line sonarjs/slow-regex
const allVarRegex = /(--[\w-]+)\s*:\s*([^;]+);/g
const allVars = []
let match
while ((match = allVarRegex.exec(stylesCss)) !== null) {
  allVars.push({ name: match[1], value: match[2] })
}

function toLabel(varName) {
  return varName
    .replace("--color-", "")
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

const colorConfig = allVars
  .filter((v) => v.name.startsWith("--color-"))
  .map((v) => ({
    label: toLabel(v.name),
    color: `var(${v.name})`,
  }))

fs.writeFileSync(
  path.resolve(__dirname, "../dist/tiptap-color-config.json"),
  JSON.stringify(colorConfig, null, 2),
  "utf8"
)

// --- tiptap-theme.css ---

const themePath = path.resolve(__dirname, "theme.css")
const themeContent = fs.readFileSync(themePath, "utf8")

const themeMatch = themeContent.match(/@theme\s+static\s*\{([\s\S]*)\}/)
if (!themeMatch) {
  console.error("Could not find @theme static block in theme.css")
  throw new Error("Invalid theme.css format")
}

const inner = themeMatch[1]
const lines = inner.split("\n")
const rootProps = []
const keyframes = []
let inKeyframes = false
let braceDepth = 0
let currentKeyframe = []

for (const line of lines) {
  if (inKeyframes) {
    currentKeyframe.push(line)
    braceDepth += (line.match(/\{/g) || []).length
    braceDepth -= (line.match(/\}/g) || []).length
    if (braceDepth === 0) {
      keyframes.push(currentKeyframe.join("\n"))
      currentKeyframe = []
      inKeyframes = false
    }
  } else if (line.trimStart().startsWith("@keyframes")) {
    inKeyframes = true
    braceDepth = 0
    currentKeyframe = [line]
    braceDepth += (line.match(/\{/g) || []).length
    braceDepth -= (line.match(/\}/g) || []).length
  } else {
    rootProps.push(line)
  }
}

const keyframesBlock =
  keyframes.length > 0 ? `\n${keyframes.join("\n\n")}\n` : ""
const output = `:root {\n${rootProps.join("\n")}\n}\n${keyframesBlock}`

fs.writeFileSync(
  path.resolve(__dirname, "../dist/tiptap-theme.css"),
  output,
  "utf8"
)
