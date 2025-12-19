const buildEslintCommand = (filenames) =>
  `eslint --fix ${filenames.map((f) => `"${f}"`).join(" ")}`

module.exports = {
  "*.{js,jsx,ts,tsx}": [buildEslintCommand],
}
