/**
 * Why a vital isn't green: clues read from Chrome's own Performance APIs
 * during each visit — the LCP element, render-blocking files, page weight,
 * third parties, main-thread blocking, the TTFB breakdown and what shifted
 * the layout — turned into recommendations tagged by where the fix lives:
 * the code, the content in Strapi, or the infrastructure.
 *
 * Pointers to where to look, not a full audit; for that, run Lighthouse in
 * Chrome DevTools or PageSpeed Insights on the page in question.
 *
 * k6 hands `handleSummary` nothing but metrics and checks, and only checks
 * carry text. So every clue travels as the name of a passing check:
 * `ⓘ <mode> <page> <key>: <value>`. They never fail the run.
 */
import { check } from "k6"

/**
 * Runs in the page before any of its scripts, so it sees the LCP element,
 * every layout shift and every long task from the start.
 */
export const OBSERVE_SCRIPT = `
  window.__vitalsDiag = { lcp: null, shifts: [], longTasks: [] };
  const watch = (type, onEntry) => {
    try {
      new PerformanceObserver((list) => list.getEntries().forEach(onEntry))
        .observe({ type, buffered: true });
    } catch (_) {}
  };
  watch("largest-contentful-paint", (e) => { window.__vitalsDiag.lcp = e; });
  watch("layout-shift", (e) => { if (!e.hadRecentInput) window.__vitalsDiag.shifts.push(e); });
  watch("longtask", (e) => { window.__vitalsDiag.longTasks.push(e.duration); });
`

/**
 * Runs in the page after it loaded; returns plain data (lists joined with
 * " ; "). k6's `evaluate` accepts a string only when it is a function.
 */
const COLLECT_SCRIPT = String.raw`() => {
  const short = (url) => {
    try {
      const u = new URL(url, location.href);
      const nextImage = u.pathname === "/_next/image" && u.searchParams.get("url");
      const path = nextImage ? "/_next/image?url=" + nextImage : u.pathname;
      const shown = u.origin === location.origin ? path : u.host + path;
      return shown.length > 110 ? shown.slice(0, 107) + "…" : shown;
    } catch (_) { return String(url).slice(0, 110); }
  };
  const describe = (el) => {
    if (!el || !el.tagName) return null;
    const tag = el.tagName.toLowerCase();
    const id = el.id ? "#" + el.id : "";
    const cls = typeof el.className === "string" && el.className.trim()
      ? "." + el.className.trim().split(/\s+/).slice(0, 2).join(".") : "";
    const src = el.currentSrc || el.src || "";
    const content = !src && el.textContent ? el.textContent.trim().slice(0, 50) : "";
    const text = content ? ' "' + content + '"' : "";
    return "<" + tag + id + cls + (src ? ' src="' + short(src) + '"' : "") + ">" + text;
  };
  // Media that comes out of the CMS: Strapi uploads, directly or through an
  // image proxy (Next.js /_next/image or imgproxy) that carries the source URL.
  const fromCms = (url) => /\/uploads\/|\/asset-library\/|\/api\/upload/.test(decodeURIComponent(url || ""));
  const kind = (e) => {
    const n = e.name.split("?")[0].toLowerCase();
    if (e.initiatorType === "script" || /\.m?js$/.test(n)) return "js";
    if (/\.css$/.test(n) || (e.initiatorType === "link" && /css/.test(n))) return "css";
    if (/\.(woff2?|ttf|otf)$/.test(n)) return "font";
    if (e.initiatorType === "img" || /\.(png|jpe?g|gif|webp|avif|svg)$/.test(n) || n.includes("/_next/image")) return "img";
    return "other";
  };
  const size = (e) => e.transferSize || e.encodedBodySize || 0;
  const kB = (bytes) => Math.round(bytes / 1024) + " kB";

  const resources = performance.getEntriesByType("resource");
  const weight = { js: 0, css: 0, img: 0, font: 0, other: 0 };
  let jsFiles = 0;
  for (const e of resources) {
    weight[kind(e)] += size(e);
    if (kind(e) === "js") jsFiles++;
  }
  const blocking = resources
    .filter((e) => e.renderBlockingStatus === "blocking")
    .sort((a, b) => size(b) - size(a));
  const largest = [...resources].sort((a, b) => size(b) - size(a)).slice(0, 5);

  const thirdParty = new Map();
  for (const e of resources) {
    try {
      const host = new URL(e.name).host;
      if (host && host !== location.host) thirdParty.set(host, (thirdParty.get(host) || 0) + size(e));
    } catch (_) {}
  }

  const nav = performance.getEntriesByType("navigation")[0];
  const diag = window.__vitalsDiag || { lcp: null, shifts: [], longTasks: [] };
  const lcp = diag.lcp;
  const lcpEl = lcp && lcp.element;
  const lcpUrl = lcp && lcp.url;
  const lcpResource = lcpUrl ? resources.find((e) => e.name === lcpUrl) : undefined;
  const lcpRect = lcpEl && lcpEl.getBoundingClientRect ? lcpEl.getBoundingClientRect() : null;
  const preloaded = lcpUrl
    ? [...document.querySelectorAll('link[rel="preload"]')].some((l) => l.href === lcpUrl || (l.imageSrcset || "").includes(new URL(lcpUrl, location.href).pathname))
    : false;

  const images = [...document.images];
  const oversized = images
    .filter((img) => img.naturalWidth && img.clientWidth && img.naturalWidth > 2 * img.clientWidth * devicePixelRatio)
    .sort((a, b) => b.naturalWidth / b.clientWidth - a.naturalWidth / a.clientWidth);
  const noDimensions = images.filter((img) => !img.getAttribute("width") && !img.getAttribute("height") && !img.style.width && !img.style.aspectRatio);

  const shiftBy = new Map();
  for (const s of diag.shifts) {
    for (const source of s.sources || []) {
      const key = describe(source.node);
      if (key) shiftBy.set(key, (shiftBy.get(key) || 0) + s.value);
    }
  }
  const shifts = [...shiftBy].sort((a, b) => b[1] - a[1]).slice(0, 3);

  return {
    lcpElement: lcp ? describe(lcpEl) || (lcpUrl ? '<img src="' + short(lcpUrl) + '">' : null) : null,
    lcpIsImage: lcpUrl ? 1 : 0,
    lcpTag: lcpEl && lcpEl.tagName ? lcpEl.tagName.toLowerCase() : null,
    lcpUrl: lcpUrl ? short(lcpUrl) : null,
    lcpFromCms: lcpUrl && fromCms(lcpUrl) ? 1 : 0,
    lcpBytes: lcpResource ? size(lcpResource) : null,
    lcpRequestedAt: lcpResource ? Math.round(lcpResource.startTime) : null,
    lcpLoading: lcpEl && lcpEl.loading ? lcpEl.loading : null,
    lcpFetchPriority: lcpEl && lcpEl.fetchPriority ? lcpEl.fetchPriority : null,
    lcpPreloaded: lcpUrl ? (preloaded ? 1 : 0) : null,
    lcpNatural: lcpEl && lcpEl.naturalWidth ? lcpEl.naturalWidth + "×" + lcpEl.naturalHeight : null,
    lcpRendered: lcpRect ? Math.round(lcpRect.width) + "×" + Math.round(lcpRect.height) : null,
    blockingCount: blocking.length,
    blockingBytes: blocking.reduce((sum, e) => sum + size(e), 0),
    blockingThirdParties: [...new Set(blocking.map((e) => { try { return new URL(e.name).host } catch (_) { return "" } }).filter((h) => h && h !== location.host))].join(" ; "),
    blockingFiles: blocking.slice(0, 8).map((e) => short(e.name) + " (" + kB(size(e)) + ")").join(" ; "),
    largestFiles: largest.map((e) => short(e.name) + " (" + kind(e) + ", " + kB(size(e)) + ")").join(" ; "),
    jsBytes: weight.js, jsFiles,
    cssBytes: weight.css, imgBytes: weight.img, fontBytes: weight.font,
    thirdParties: [...thirdParty].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([host, bytes]) => host + " (" + kB(bytes) + ")").join(" ; "),
    thirdPartyBytes: [...thirdParty.values()].reduce((sum, b) => sum + b, 0),
    oversizedImages: oversized.length,
    oversizedList: oversized.slice(0, 3).map((img) => short(img.currentSrc || img.src) + " (" + img.naturalWidth + "px shown at " + img.clientWidth + "px" + (fromCms(img.currentSrc || img.src) ? ", CMS" : "") + ")").join(" ; "),
    imagesWithoutDimensions: noDimensions.length,
    longTasks: diag.longTasks.length,
    blockingTime: Math.round(diag.longTasks.reduce((sum, d) => sum + Math.max(0, d - 50), 0)),
    redirects: nav ? nav.redirectCount : null,
    beforeRequest: nav ? Math.round(nav.requestStart - nav.startTime) : null,
    dns: nav ? Math.round(nav.domainLookupEnd - nav.domainLookupStart) : null,
    connect: nav ? Math.round(nav.connectEnd - nav.connectStart) : null,
    wait: nav ? Math.round(nav.responseStart - nav.requestStart) : null,
    shiftSources: shifts.map(([el, value]) => el + " (" + value.toFixed(2) + ")").join(" ; "),
  };
}`

type Diagnostics = Record<string, string | number | null>

const PREFIX = "ⓘ "

/** Collects the clues of one visit and records them as passing checks. */
export async function recordDiagnostics(
  page: { evaluate: (script: string) => Promise<unknown> },
  mode: string,
  path: string
): Promise<void> {
  let diag: Diagnostics
  try {
    diag = (await page.evaluate(COLLECT_SCRIPT)) as Diagnostics
  } catch {
    return // diagnostics are best effort; the vitals themselves still count
  }
  for (const [key, value] of Object.entries(diag)) {
    if (value === null || value === "") continue
    check(true, { [`${PREFIX}${mode} ${path} ${key}: ${value}`]: () => true })
  }
}

/** One page × device worth of clues: numbers as their median, text as the most common value. */
export interface Clues {
  number: (key: string) => number | undefined
  text: (key: string) => string | undefined
}

export function readClues(
  checks: { name: string; passes: number }[],
  mode: string,
  path: string
): Clues {
  const values = new Map<string, { value: string; count: number }[]>()
  const start = `${PREFIX}${mode} ${path} `
  for (const { name, passes } of checks) {
    if (!name.startsWith(start)) continue
    const rest = name.slice(start.length)
    const separator = rest.indexOf(": ")
    const key = rest.slice(0, separator)
    const value = rest.slice(separator + 2)
    values.set(key, [...(values.get(key) ?? []), { value, count: passes }])
  }

  return {
    number: (key) => {
      const all = (values.get(key) ?? [])
        .flatMap(({ value, count }) =>
          Array.from({ length: count }, () => Number(value))
        )
        .sort((a, b) => a - b)

      return all.length === 0 ? undefined : all[Math.floor(all.length / 2)]
    },
    text: (key) =>
      [...(values.get(key) ?? [])].sort((a, b) => b.count - a.count)[0]?.value,
  }
}

const kB = (bytes: number | undefined) =>
  bytes === undefined ? "?" : `${Math.round(bytes / 1024)} kB`

/** Short clues for the terminal (used when no investigation file is written). */
export function explain(
  clues: Clues,
  notGreen: Set<string>,
  throttled: boolean
): string[] {
  const lines: string[] = []
  if (notGreen.has("LCP")) {
    const bytes = clues.number("lcpBytes")
    lines.push(
      `LCP  → largest element: ${clues.text("lcpElement") ?? "not reported"}${bytes === undefined ? "" : ` (${kB(bytes)})`}`
    )
  }
  if (notGreen.has("FCP")) {
    const count = clues.number("blockingCount") ?? 0
    lines.push(
      count === 0
        ? "FCP  → no render-blocking files; look at TTFB and main-thread time"
        : `FCP  → ${count} render-blocking file(s), ${kB(clues.number("blockingBytes"))}: ${clues.text("blockingFiles") ?? ""}`
    )
  }
  if (notGreen.has("TTFB")) {
    lines.push(
      `TTFB → before the request ${clues.number("beforeRequest") ?? "?"} ms (redirects: ${clues.number("redirects") ?? "?"}) + waiting for the server ${clues.number("wait") ?? "?"} ms${throttled ? " (includes 562 ms emulated 4G latency)" : ""}`
    )
  }
  if (notGreen.has("CLS")) {
    lines.push(
      `CLS  → shifted most: ${clues.text("shiftSources") ?? "not reported"}`
    )
  }
  lines.push(
    `page weight: JS ${kB(clues.number("jsBytes"))} in ${clues.number("jsFiles") ?? "?"} files · CSS ${kB(clues.number("cssBytes"))} · images ${kB(clues.number("imgBytes"))} · fonts ${kB(clues.number("fontBytes"))}`,
    `main thread: ${clues.number("longTasks") ?? "?"} long tasks, ${clues.number("blockingTime") ?? "?"} ms blocked (Total Blocking Time)`
  )

  return lines
}

/** Where a fix lives. */
type Area = "Content · Strapi" | "Code" | "Infra"

export interface Recommendation {
  area: Area
  text: string
}

/** What one part of the investigation adds to the findings and recommendations. */
interface Part {
  findings: string[]
  recommendations: Recommendation[]
}

const list = (text: string | undefined) =>
  (text ?? "").split(" ; ").filter(Boolean)

const IMAGE_FILES =
  "`apps/ui/src/components/page-builder/components/utilities/StrapiBasicImage.tsx` and `apps/ui/src/components/elementary/images/ImgproxyImage.tsx`"

/** What the LCP element is and how it loaded. */
function lcpFindings(clues: Clues): string[] {
  const isImage = clues.number("lcpIsImage") === 1
  const fromCms = clues.number("lcpFromCms") === 1
  const bytes = clues.number("lcpBytes")
  const requestedAt = clues.number("lcpRequestedAt")
  const loading = clues.text("lcpLoading")
  const preloaded = clues.number("lcpPreloaded") === 1
  const natural = clues.text("lcpNatural")
  const rendered = clues.text("lcpRendered")

  return [
    `**LCP element:** \`${clues.text("lcpElement") ?? "not reported"}\``,
    ...(isImage
      ? [
          `  - source: \`${clues.text("lcpUrl")}\`${fromCms ? " — **uploaded through the CMS (Strapi media)**" : ""}`,
          `  - size ${kB(bytes)}${natural ? ` · intrinsic ${natural} px` : ""} · rendered ${rendered ?? "?"} px${clues.text("lcpTag") === "img" ? "" : ` · shown as a CSS background of \`<${clues.text("lcpTag") ?? "?"}>\`, not an \`<img>\``}`,
          `  - requested ${requestedAt ?? "?"} ms after navigation · loading=\`${loading ?? "eager"}\` · fetchpriority=\`${clues.text("lcpFetchPriority") ?? "auto"}\` · preloaded: ${preloaded ? "yes" : "no"}`,
        ]
      : [
          "  - a text block, not an image: its timing follows fonts, CSS and the server response",
        ]),
  ]
}

/** A recommendation when the LCP image is heavier than 200 kB. */
function heavyImage(
  bytes: number | undefined,
  fromCms: boolean
): Recommendation | undefined {
  if (bytes === undefined || bytes <= 200 * 1024) return undefined

  return fromCms
    ? {
        area: "Content · Strapi",
        text: `The LCP image weighs ${kB(bytes)}. Replace it in the Strapi Media Library with a compressed version (aim for under 200 kB, WebP/AVIF, no wider than about 2× its displayed width).`,
      }
    : {
        area: "Code",
        text: `The LCP image weighs ${kB(bytes)}. Compress it (WebP/AVIF) and serve it through the image optimiser.`,
      }
}

/** Why the browser found the LCP image late: CSS background, lazy loading or no preload. */
function lateDiscovery(clues: Clues): Recommendation | undefined {
  const requestedAt = clues.number("lcpRequestedAt")
  const tag = clues.text("lcpTag")
  if (
    tag !== undefined &&
    tag !== "img" &&
    tag !== "image" &&
    tag !== "video"
  ) {
    return {
      area: "Code",
      text: `The LCP image is a CSS background of \`<${tag}>\`, which the browser only discovers after downloading and parsing the CSS${requestedAt === undefined ? "" : ` (here ${requestedAt} ms after navigation)`}. Render it as an \`<img>\` with \`priority\` (next/image), or preload it with \`<link rel="preload" as="image" fetchpriority="high">\`.`,
    }
  }
  if (clues.text("lcpLoading") === "lazy") {
    return {
      area: "Code",
      text: `The LCP image is lazy-loaded, so the browser fetches it late. Render the first image of the page with \`priority\` (next/image) or \`loading="eager"\` + \`fetchpriority="high"\` — see ${IMAGE_FILES} — and pass \`priority\` from the first section of the page.`,
    }
  }
  if (clues.number("lcpPreloaded") !== 1) {
    return {
      area: "Code",
      text: `The LCP image isn't preloaded${requestedAt === undefined ? "" : ` and starts downloading ${requestedAt} ms after navigation`}. Mark it \`priority\` so Next.js preloads it — see ${IMAGE_FILES}.`,
    }
  }

  return undefined
}

function lcpPart(clues: Clues, notGreen: Set<string>): Part {
  const isImage = clues.number("lcpIsImage") === 1
  const fromCms = clues.number("lcpFromCms") === 1
  const bytes = clues.number("lcpBytes")
  const natural = clues.text("lcpNatural")
  const rendered = clues.text("lcpRendered")
  const naturalWidth = Number((natural ?? "").split("×", 1)[0])
  const renderedWidth = Number((rendered ?? "").split("×", 1)[0])

  const findings = lcpFindings(clues)
  if (!notGreen.has("LCP")) return { findings, recommendations: [] }

  const recommendations: Recommendation[] = []
  if (!isImage) {
    recommendations.push({
      area: "Code",
      text: "The LCP element is text, so it waits for CSS and fonts. Check the render-blocking files below and that `apps/ui/src/lib/fonts.ts` loads fonts with `display: swap` and only the weights in use.",
    })

    return { findings, recommendations }
  }
  const discovery = lateDiscovery(clues)
  if (discovery) recommendations.push(discovery)
  const heavy = heavyImage(bytes, fromCms)
  if (heavy) recommendations.push(heavy)
  if (renderedWidth > 0 && naturalWidth > 2.5 * renderedWidth) {
    recommendations.push({
      area: fromCms ? "Content · Strapi" : "Code",
      text: `The LCP image is ${naturalWidth}px wide but shown at ${renderedWidth}px. ${fromCms ? "Upload a smaller rendition in Strapi, or make sure" : "Make sure"} the image component requests a resized version (\`sizes\` / imgproxy width) instead of the original.`,
    })
  }

  return { findings, recommendations }
}

function fcpPart(clues: Clues, notGreen: Set<string>): Part {
  const files = list(clues.text("blockingFiles"))
  const findings = [
    `**Render-blocking files:** ${clues.number("blockingCount") ?? 0} (${kB(clues.number("blockingBytes"))})`,
    ...files.map((file) => `  - \`${file}\``),
  ]
  const count = clues.number("blockingCount") ?? 0
  if (!notGreen.has("FCP") || count === 0) {
    return { findings, recommendations: [] }
  }
  const thirdParties = list(clues.text("blockingThirdParties"))

  return {
    findings,
    recommendations: [
      ...(thirdParties.length > 0
        ? [
            {
              area: "Code" as const,
              text: `Third parties block the first paint: ${thirdParties.map((host) => `\`${host}\``).join(", ")}. Load them without blocking (\`next/script\` with \`strategy="afterInteractive"\` or \`lazyOnload\`, or \`async\`/\`defer\`), or only when needed — a map, for example, when it scrolls into view.`,
            },
          ]
        : []),
      {
        area: "Code",
        text: `${count} file(s) (${kB(clues.number("blockingBytes"))}) block the first paint. Keep only the CSS the first screen needs render-blocking, drop unused stylesheets, and move synchronous scripts out of \`<head>\`.`,
      },
    ],
  }
}

function ttfbPart(
  clues: Clues,
  notGreen: Set<string>,
  throttled: boolean
): Part {
  const wait = clues.number("wait")
  const redirects = clues.number("redirects") ?? 0
  const findings = [
    `**TTFB breakdown:** before the request ${clues.number("beforeRequest") ?? "?"} ms (redirects ${redirects}, DNS ${clues.number("dns") ?? "?"} ms, connecting ${clues.number("connect") ?? "?"} ms) + waiting for the server ${wait ?? "?"} ms${throttled ? " (includes 562 ms emulated 4G latency)" : ""}`,
  ]
  if (!notGreen.has("TTFB")) return { findings, recommendations: [] }

  const recommendations: Recommendation[] = []
  if (redirects > 0) {
    recommendations.push({
      area: "Infra",
      text: `The page is reached through ${redirects} redirect(s). Link to the final URL (trailing slash, www, locale prefix) — check \`BASE_URL\` and the paths in \`helpers/urls.json\` too.`,
    })
  }
  const serverWait = (wait ?? 0) - (throttled ? 562 : 0)
  if (serverWait > 400) {
    recommendations.push({
      area: "Infra",
      text: `The server needs about ${serverWait} ms to start answering. Check that the page is served from the Next.js cache (\`x-nextjs-cache: HIT\`) or a CDN, and how long the Strapi requests behind it take.`,
    })
  }

  return { findings, recommendations }
}

function clsPart(clues: Clues, notGreen: Set<string>): Part {
  const sources = list(clues.text("shiftSources"))
  const noDimensions = clues.number("imagesWithoutDimensions") ?? 0
  const findings = [
    `**Layout shifts:** ${sources.length === 0 ? "none recorded" : sources.length}`,
    ...sources.map((source) => `  - \`${source}\``),
    `**Images without width/height:** ${noDimensions}`,
  ]
  if (!notGreen.has("CLS")) return { findings, recommendations: [] }

  return {
    findings,
    recommendations: [
      {
        area: "Code",
        text: "Reserve space for content that loads late: give images width/height (or an aspect-ratio) from the Strapi media fields, and keep banners and embeds from pushing content down.",
      },
      ...(noDimensions > 0
        ? [
            {
              area: "Content · Strapi" as const,
              text: `${noDimensions} image(s) render without dimensions. If they come from rich text or embeds in Strapi, re-insert them through the Media Library so width and height are stored.`,
            },
          ]
        : []),
    ],
  }
}

function weightPart(clues: Clues): Part {
  const oversized = clues.number("oversizedImages") ?? 0
  const oversizedList = clues.text("oversizedList") ?? ""
  const thirdParties = list(clues.text("thirdParties"))
  const blockingTime = clues.number("blockingTime") ?? 0
  const jsBytes = clues.number("jsBytes") ?? 0

  const findings = [
    `**Page weight:** JS ${kB(jsBytes)} in ${clues.number("jsFiles") ?? "?"} files · CSS ${kB(clues.number("cssBytes"))} · images ${kB(clues.number("imgBytes"))} · fonts ${kB(clues.number("fontBytes"))}`,
    "**Largest files:**",
    ...list(clues.text("largestFiles")).map((file) => `  - \`${file}\``),
    `**Oversized images (more than 2× their displayed size):** ${oversized}`,
    ...list(oversizedList).map((image) => `  - \`${image}\``),
    `**Third parties:** ${thirdParties.length === 0 ? "none" : kB(clues.number("thirdPartyBytes"))}`,
    ...thirdParties.map((host) => `  - \`${host}\``),
    `**Main thread:** ${clues.number("longTasks") ?? "?"} long tasks, ${blockingTime} ms blocked (Total Blocking Time)`,
  ]

  const recommendations: Recommendation[] = []
  if (oversized > 0) {
    const cms = oversizedList.includes("CMS")
    recommendations.push({
      area: cms ? "Content · Strapi" : "Code",
      text: `${oversized} image(s) are downloaded at more than twice the size they're shown at.${cms ? " Some come from Strapi: upload smaller versions or let the image component request resized renditions." : " Pass accurate `sizes` to next/image."}`,
    })
  }
  const fontBytes = clues.number("fontBytes") ?? 0
  if (fontBytes > 300 * 1024) {
    recommendations.push({
      area: "Code",
      text: `${kB(fontBytes)} of fonts. Load only the families and weights in use (\`apps/ui/src/lib/fonts.ts\`), subset them, and replace icon fonts with SVG icons.`,
    })
  }
  if (jsBytes > 500 * 1024) {
    recommendations.push({
      area: "Code",
      text: `${kB(jsBytes)} of JavaScript. Look for large client components and libraries that could load on demand (\`next/dynamic\`) or stay on the server.`,
    })
  }
  if (blockingTime > 200) {
    recommendations.push({
      area: "Code",
      text: `The main thread is blocked for ${blockingTime} ms. Defer non-critical scripts${thirdParties.length > 0 ? ", especially third parties," : ""} and split heavy hydration.`,
    })
  }

  return { findings, recommendations }
}

/**
 * Detailed findings and tagged recommendations for one page × device — the
 * body of an investigation file, written for a person or a coding agent.
 */
export function investigate(
  clues: Clues,
  notGreen: Set<string>,
  throttled: boolean
): Part {
  const parts = [
    lcpPart(clues, notGreen),
    fcpPart(clues, notGreen),
    ttfbPart(clues, notGreen, throttled),
    clsPart(clues, notGreen),
    weightPart(clues),
  ]
  const recommendations = parts.flatMap((part) => part.recommendations)

  return {
    findings: parts.flatMap((part) => part.findings),
    recommendations:
      recommendations.length > 0
        ? recommendations
        : [
            {
              area: "Code",
              text: "No single cause stands out. Run Lighthouse in Chrome DevTools or PageSpeed Insights on this page for the full list of opportunities.",
            },
          ],
  }
}
