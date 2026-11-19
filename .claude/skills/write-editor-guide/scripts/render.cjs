/**
 * Prints the guide HTML to two PDFs: the cover without margins and the body with header/footer.
 * Usage: node render.cjs <guide.html> <coverOut.pdf> <bodyOut.pdf>
 * Expects brand/ (from extract-brand.sh) next to the HTML.
 */
const fs = require("fs")
const path = require("path")

/** Resolves Playwright from the pnpm store, since qa/tests/playwright only links the binary. */
function loadPlaywright() {
  const store = path.resolve("node_modules/.pnpm")
  const dir = fs
    .readdirSync(store)
    .filter((d) => /^playwright@\d/.test(d))
    .sort()
    .pop()
  return require(path.join(store, dir, "node_modules/playwright"))
}

;(async () => {
  const [html, coverOut, bodyOut] = process.argv.slice(2).map((p) => path.resolve(p))
  const brand = path.join(path.dirname(html), "brand")
  const dataUri = (file, mime) => `data:${mime};base64,${fs.readFileSync(path.join(brand, file)).toString("base64")}`
  const MIME = { svg: "image/svg+xml", png: "image/png", webp: "image/webp", jpg: "image/jpeg", jpeg: "image/jpeg" }
  const logoFile = fs.readdirSync(brand).find((f) => /^logo\.\w+$/.test(f))
  if (!logoFile) throw new Error(`No logo.* in ${brand}. Run extract-brand.sh first.`)
  const logo = dataUri(logoFile, MIME[path.extname(logoFile).slice(1).toLowerCase()] ?? "image/png")
  const strapi = dataUri("strapi-logo.svg", "image/svg+xml")

  const { chromium } = loadPlaywright()
  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.goto("file://" + html, { waitUntil: "networkidle" })
  await page.evaluate(() => document.fonts.ready)

  await page.pdf({ path: coverOut, format: "A4", printBackground: true, pageRanges: "1", margin: { top: 0, bottom: 0, left: 0, right: 0 } })

  const header = `<div style="width:100%;margin:0 16mm;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #e2e5ea;padding-bottom:2mm;font-family:Helvetica,Arial,sans-serif;font-size:7.5pt;color:#666687">
    <img src="${logo}" style="height:4.2mm"><span style="display:flex;align-items:center;gap:1.5mm">Strapi Editor How-To Guide <img src="${strapi}" style="height:4mm"></span></div>`
  const notum = dataUri("notum-logo.svg", "image/svg+xml")
  const sep = `<span style="width:1px;height:3mm;background:#d5d8de"></span>`
  const footer = `<div style="width:100%;margin:0 16mm;display:flex;justify-content:space-between;align-items:center;font-family:Helvetica,Arial,sans-serif;font-size:7pt;color:#8e8ea9">
    <span style="display:flex;align-items:center;gap:2.5mm;opacity:.75">
      <img src="${logo}" style="height:3.4mm;filter:grayscale(1)">${sep}
      <img src="${strapi}" style="height:3.2mm;filter:grayscale(1)">${sep}
      <span style="display:flex;align-items:center;gap:1.2mm">built by <img src="${notum}" style="height:2.4mm"></span>
    </span><span class="pageNumber" style="color:#222"></span></div>`
  await page.pdf({
    path: bodyOut,
    format: "A4",
    printBackground: true,
    pageRanges: "2-",
    displayHeaderFooter: true,
    headerTemplate: header,
    footerTemplate: footer,
    margin: { top: "22mm", bottom: "18mm", left: "16mm", right: "16mm" },
  })
  await browser.close()
})()
