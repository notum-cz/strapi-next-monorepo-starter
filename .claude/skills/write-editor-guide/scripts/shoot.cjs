/**
 * Screenshots page-builder sections for the editor guide.
 * Usage: node shoot.cjs <jobs.json> <outDir>
 * Each job: { name, url, index? | selector?, maxHeight?, replaceText? } → <outDir>/<name>.jpg
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
  if (!dir) throw new Error("Playwright not installed. Run pnpm install at the repo root.")
  return require(path.join(store, dir, "node_modules/playwright"))
}

// Some asset hosts and CDNs block the HeadlessChrome user agent (ERR_BLOCKED_BY_ORB).
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"

/** Loads a page, scrolls it once so lazy images start, and hides the top navbar. */
async function openPage(page, url) {
  await page.goto(url, { waitUntil: "networkidle", timeout: 120000 })
  await page.addStyleTag({
    content: "#CybotCookiebotDialog,#CybotCookiebotDialogBodyUnderlay{display:none!important}",
  })
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 150))
    }
    window.scrollTo(0, 0)
  })
  // Only the full-width bar at the top: other sticky elements (e.g. a sticky column inside a section) are content.
  await page.evaluate(() => {
    for (const el of document.querySelectorAll("body *")) {
      const pos = getComputedStyle(el).position
      const r = el.getBoundingClientRect()
      if ((pos === "fixed" || pos === "sticky") && r.top < 5 && r.height < 160 && r.width > 1000) {
        el.style.setProperty("display", "none", "important")
      }
    }
  })
  await page.waitForTimeout(1500)
}

/**
 * Returns the nth page-builder section wrapper, or null.
 * StrapiDynamicZoneRenderer wraps each section in a sibling `div#a-<component>`, in content-zone order.
 * Projects that changed the renderer may use another wrapper: the `div.empty:hidden` fallback covers one known variant.
 */
async function sectionAt(page, index) {
  const handle = await page.evaluateHandle((i) => {
    const anchors = [...document.querySelectorAll('main [id^="a-"]')]
    const parent = anchors[0]?.parentElement
    const sections = anchors.filter((e) => e.parentElement === parent)
    if (sections.length) return sections[i] ?? null
    let root = document.querySelector("main")
    while (root && root.children.length === 1) root = root.children[0]
    return [...(root?.children ?? [])].filter((e) => e.classList.contains("empty:hidden"))[i] ?? null
  }, index)
  return handle.asElement()
}

/** Re-requests images that failed, which busy asset hosts do under load (HTTP2 refused stream). */
async function retryBrokenImages(page) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const retried = await page.evaluate(() => {
      let count = 0
      for (const img of document.images) {
        if (img.currentSrc && img.complete && img.naturalWidth === 0) {
          const src = img.src
          img.src = ""
          img.src = src
          count++
        }
      }
      return count
    })
    if (!retried) return
    await page.waitForTimeout(2500)
  }
}

;(async () => {
  const [jobsFile, outDir] = process.argv.slice(2)
  if (!jobsFile || !outDir) throw new Error("Usage: node shoot.cjs <jobs.json> <outDir>")
  const jobs = JSON.parse(fs.readFileSync(jobsFile, "utf8"))
  fs.mkdirSync(outDir, { recursive: true })

  const { chromium } = loadPlaywright()
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, userAgent: USER_AGENT })
  const page = await context.newPage()
  let current = null

  for (const job of jobs) {
    try {
      if (current !== job.url) {
        await openPage(page, job.url)
        current = job.url
      }
      const el = job.selector ? await page.$(job.selector) : await sectionAt(page, job.index)
      if (!el) throw new Error("element not found")

      if (job.replaceText) {
        await el.evaluate((node, map) => {
          for (const x of node.querySelectorAll("*")) {
            if (x.children.length) continue
            const t = x.textContent.trim()
            if (Object.hasOwn(map, t)) x.textContent = map[t]
          }
        }, job.replaceText)
      }

      await el.scrollIntoViewIfNeeded()
      await page.waitForTimeout(800)
      await retryBrokenImages(page)
      const box = await el.boundingBox()
      const scrollY = await page.evaluate(() => window.scrollY)
      await page.screenshot({
        path: path.join(outDir, `${job.name}.jpg`),
        type: "jpeg",
        quality: 78,
        fullPage: true,
        clip: { x: 0, y: box.y + scrollY, width: 1440, height: Math.min(box.height, job.maxHeight ?? 1150) },
      })
      console.log("ok", job.name, Math.round(box.height))
    } catch (e) {
      console.log("FAIL", job.name, String(e.message).split("\n")[0])
    }
  }
  await browser.close()
})()
