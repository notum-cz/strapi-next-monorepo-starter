const fs = require("node:fs")

// Symlinked files (e.g. AGENTS.md → CLAUDE.md) can't be formatted/linted when
// passed explicitly — prettier/eslint error on them. Drop symlinks from the list.
const realFiles = (files) =>
  files.filter((f) => {
    try {
      return fs.existsSync(f) && !fs.lstatSync(f).isSymbolicLink()
    } catch {
      return false
    }
  })

module.exports = {
  "*.{js,jsx,ts,tsx}": (files) => {
    const real = realFiles(files)
    return real.length
      ? [`eslint --fix ${real.map((f) => JSON.stringify(f)).join(" ")}`]
      : []
  },
  "*.{md,css,scss}": (files) => {
    const real = realFiles(files)
    return real.length
      ? [`prettier --write ${real.map((f) => JSON.stringify(f)).join(" ")}`]
      : []
  },
}
