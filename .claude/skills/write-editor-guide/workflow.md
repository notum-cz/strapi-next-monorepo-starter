# Editor guide workflow

All commands run from the repo root. Put scratch files in the session scratchpad. `$W` below is that work dir.

## Environments

The guide is shot from the deployed environments. Hosts differ per project, so collect them first:

| Env  | Website      | Strapi API (public, read-only) |
| ---- | ------------ | ------------------------------ |
| dev  | `<web-dev>`  | `<cms-dev>`                    |
| stg  | `<web-stg>`  | `<cms-stg>`                    |
| prod | `<web-prod>` | `<cms-prod>`                   |

Look for them in the deploy workflows under `.github/workflows/`, the project README or the env docs. If they are not there, ask the user. Confirm the prod host with the user before shooting prod. A project may replace this table with its real hosts.

The Strapi admin needs a login, so the guide has no admin screenshots unless the user provides them.

## 1. Read the schemas that ship

`<ship>` is the branch that deploys to production. In the starter it is `main`. Projects often use `staging`.

```bash
git fetch -q origin
git show origin/<ship>:apps/strapi/src/api/page/content-types/page/schema.json
git ls-tree -r --name-only origin/<ship> apps/strapi/src/components
git show origin/<ship>:apps/strapi/src/components/sections/<name>.json
git diff --stat HEAD origin/<ship> -- apps/strapi/src   # what the local checkout is missing
```

Compare the page `content` components with the `.comp` blocks in `template/guide.html`. Every component in the zone needs a block. Collection types editors touch belong in chapter 2, and in their own chapter when they have a workflow.

## 2. Find where each component is used

```bash
python3 -I .claude/skills/write-editor-guide/scripts/component-usage.py <cms-stg>
python3 -I .claude/skills/write-editor-guide/scripts/component-usage.py <cms-dev>
```

The script prints `component -> [(fullPath, index), …]`. The index is the section's position in the page's `content` zone, which is what `shoot.cjs` needs. Pages must be readable by the public API role.

## 3. Screenshot the sections

Write a jobs file, for example `$W/jobs.json`:

```json
[
  {
    "name": "hero",
    "url": "<web-stg>/about",
    "index": 0
  },
  {
    "name": "faq",
    "url": "<web-dev>/test-page",
    "index": 3,
    "replaceText": {
      "Lorem ipsum FAQ": "Frequently asked questions"
    }
  },
  {
    "name": "footer",
    "url": "<web-stg>/",
    "selector": "footer"
  }
]
```

```bash
node .claude/skills/write-editor-guide/scripts/shoot.cjs $W/jobs.json $W/shots
```

- `index` crops the nth section wrapper (`div#a-<component>`). `selector` crops any element instead, e.g. `#a-hero-2` for the second hero.
- `replaceText` swaps exact leaf-text matches before the shot. Use it only to hide test copy.
- `maxHeight` (default 1150 px) caps tall listings. The guide shows the top part only anyway.
- Look at every shot before using it (build a contact sheet or Read the jpg). Watch for broken-image placeholders, test copy and overlapping bars.
- Shot names must match the `src` of the `<img class="shot">` tags in `guide.html`.

## 4. Brand assets

```bash
bash .claude/skills/write-editor-guide/scripts/extract-brand.sh $W/brand [path/to/project-logo]
```

It copies the client's logo to `brand/logo.<ext>` (the Notum logo when no path is given), copies the Notum logo, and extracts the Strapi icon SVG from the installed `@strapi/admin` package. Use a logo that reads well on white: it sits on the white cover and in the header. Do not use `apps/ui/public/images/logo.svg` unless the project replaced it: in the starter it is a demo mark.

## 5. Edit the HTML

```bash
cp .claude/skills/write-editor-guide/template/guide.html $W/guide.html
```

- On the first run in a project, fill the placeholders and brand tokens first (SKILL.md, "First run in a project").
- Component block pattern:

  ```html
  <div class="comp">
    <h3>Statistics <span class="pick">· Sections → Statistics</span></h3>
    <p>One sentence: what it is and where it is used.</p>
    <img class="shot short" src="shots/statistics.jpg" alt="" />
    <table>
      <tr>
        <td>Field *</td>
        <td>What it does on the website. Default, limits, options.</td>
      </tr>
    </table>
  </div>
  ```

- `class="shot short"` is for low sections (callouts, heroes, stats). Leave plain `shot` for the rest.
- The picker path uses the component's category and Strapi `displayName` (e.g. `Sections → HeadingWithCTAButton` for `sections.heading-with-cta-button`).
- Skip internal or generated fields (`fullPath`, legacy IDs), or mark them "do not edit".
- Bump the version on the cover.

## 6. Render

```bash
bash .claude/skills/write-editor-guide/scripts/render.sh $W/guide.html docs/<Project>-Strapi-How-To-Guide.pdf
```

`render.sh` installs `pypdf` into `$W/py` on first use, prints page 1 without margins (cover), prints pages 2+ with the header/footer template, and merges them.

## 7. Verify

- Check page 1 is only the cover and page 2 starts with Contents:

  ```bash
  PYTHONPATH=$W/py python3 -c "from pypdf import PdfReader; r=PdfReader('docs/<Project>-Strapi-How-To-Guide.pdf'); print(len(r.pages), [r.pages[i].extract_text()[:40] for i in (0,1)])"
  ```

- Check no placeholder is left: `grep -n '{{' $W/guide.html` must print nothing.
- Look at the cover as printed: on macOS `qlmanage -t -s 1100 -o $W <pdf>` writes a PNG of page 1. The cover must fill the page edge to edge (`@page :first { margin: 0 }`), otherwise the PDF shows white margins around a shrunken cover.
- Other pages cannot be rasterised without poppler. Screenshot the HTML in print media with Playwright instead (a chapter or two), and tell the user which parts were checked only as text.
- Copy the edited `$W/guide.html` back to `template/guide.html`.
