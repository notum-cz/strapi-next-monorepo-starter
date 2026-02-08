import fs from "fs"

export const POPULATE_CONFIG: Record<string, any> = {}

// import all config files in this directory and add them to the POPULATE_CONFIG object
const configFiles = fs.readdirSync(__dirname)
configFiles.forEach((file) => {
  if (file.endsWith(".ts")) {
    const config = require(`./${file}`)
    POPULATE_CONFIG[file.replace(".ts", "")] = config.default
  }
})
