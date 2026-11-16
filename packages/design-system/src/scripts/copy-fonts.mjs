import { cp } from "node:fs/promises"

await cp("./src/fonts", "./dist/fonts", {
  recursive: true,
})
