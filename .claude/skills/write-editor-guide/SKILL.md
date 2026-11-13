---
name: write-editor-guide
description: >
  Use when the user wants a customer-facing guide for the project's content editors —
  e.g. "how-to for the client", "editor guide", "Strapi manual", "content manager
  documentation", "PDF for the customer", "update the Strapi how-to", "add a component to
  the guide", or before a release when new page-builder sections ship. Produces or updates
  the branded PDF in docs/ with a screenshot per component.
argument-hint: "[what changed or which release]"
---

# Write the Strapi editor guide

Produces `docs/<Project>-Strapi-How-To-Guide.pdf`: an English, non-technical guide for the client's content team. It explains Strapi basics, creating pages, every page-builder section with a screenshot, SEO, the Media Library, navbar/footer, redirects, form submissions and troubleshooting.

The HTML source lives in [`template/guide.html`](template/guide.html). **Update it, do not rewrite it.** Most requests are "a component was added or changed" and touch one block.

## First run in a project

The starter ships a generic template. Before the first guide for a project:

1. **Placeholders.** Replace `{{PROJECT_NAME}}`, `{{VERSION}}`, `{{DATE}}`, `{{RELEASE}}` and `{{LOCALES}}` (listed in the comment at the top of `guide.html`). Take the project name from the user. Take locales from `apps/ui/src/lib/navigation.ts`.
2. **Brand.** The template defaults follow notum.tech: eerie black `#2b292d`, ice blue `#ebf1fb`, Manrope. Keep them when the guide should look like Notum. To brand it for the client, set the `:root` tokens (`--brand`, `--brand-dark`, `--brand-light`, `--accent`…) and `--font-heading` / `--font-body` from the project's design system (`packages/design-system/src/styles/`) or the live site, and swap the Google Fonts link. Confirm the choice with the user.
3. **Logo.** Pass the client's logo to `extract-brand.sh`. Without it the script uses the Notum logo, which is only right for previewing the template. If the logo is not an SVG, change the cover `<img src="brand/logo.svg">` to the right extension.
4. **Content.** Align chapters 2 and 7 with the project's schemas: add blocks for project-specific components and collection types, delete blocks for starter components the project removed. Add chapters for collection types with their own editor workflow (FAQ groups, testimonials, blog…).
5. **Commit the filled template** back to `template/guide.html` in the project. From then on, every run updates it.

## Audience and tone

- Readers are content managers, not developers. Explain what a field does on the website, never how it is implemented.
- Never mention code paths, middlewares, cache tags, env vars or internal decision IDs.
- English, short sentences, imperative steps. Apply the `notum-writing-style` skill if it is available.
- Required fields are marked `*`. Defaults are stated in words ("Default H2").

## Workflow

Detailed commands are in [workflow.md](workflow.md). In short:

1. **Use the branch that ships, not the local checkout.** Run `git fetch` and read schemas with `git show` from the branch that deploys to production (check `.github/workflows`). A stale local branch can be many components behind, and the guide then misses them. Never edit the working tree for this.
2. **Collect the facts.** Read the component schemas (`displayName`, `description`, field `description`, `conditions`, `min`/`max`, defaults) and the page `content` dynamic zone. Read the matching docs page under `apps/docs/docs/` only for behaviour, because docs can be stale. Check UI code under `apps/ui/src/components/page-builder/` when a behaviour matters to editors (sorting, filters, what renders when empty).
3. **Find a real usage of each component** with `scripts/component-usage.py`. Prefer stg pages with real content, then dev pages. Use dev showcase pages only as a last resort.
4. **Take screenshots** with `scripts/shoot.cjs`. It crops one section by its index in the page's `content` zone.
5. **Edit `template/guide.html`.** Copy it into a scratch work dir together with `shots/` and `brand/`.
6. **Render** with `scripts/render.sh`. It prints the cover without margins, prints the body with a branded header and a footer (grey project logo, Strapi and "built by Notum" logos plus the page number), then merges the two.
7. **Verify visually** before reporting (see workflow.md). Then copy the updated HTML back into `template/`.

## Screenshot gotchas (learned the hard way)

- **Send a normal desktop Chrome User-Agent.** Some asset hosts block headless Chrome (`ERR_BLOCKED_BY_ORB`), so images look broken although they load for visitors. `shoot.cjs` already sets it and retries failed images.
- **Hide only the top navbar.** It is a fixed or sticky bar that overlaps cropped sections. Do not hide every sticky element: a section can have a sticky column that would vanish.
- **Index sections by their wrapper.** `StrapiDynamicZoneRenderer` renders each section inside a sibling `div#a-<component>` wrapper, in the same order as the Strapi `content` array. Breadcrumbs and other elements sit between wrappers but are not counted. If a project changed the renderer, adjust `sectionAt()` in `shoot.cjs`.
- **Test content must not reach the customer.** When the only usage is a test page ("Hi test", lorem ipsum), use the `replaceText` option of `shoot.cjs` to swap in neutral example copy, and say so in the guide intro.
- The local apps are usually not running. Shoot the deployed environments (see workflow.md).

## Design rules

- **Cover:** light, in the style of notum.tech. White page, project logo & Strapi in the top row, a large ice-blue panel with rounded corners holding a pill badge, the title, a subtitle and three dark cards (version, date, release), then "Built by Notum" at the bottom.
- **Body:** restrained. `--brand` for headings and table headers, `--accent` for the chapter rule and tips, amber for warnings.
- **Do not** use gradients, decorative circles, topic chips, Strapi purple outside the Strapi logo, filled number circles, boxed component frames or a colour legend. Reviewers rejected them as "too designed". Steps use thin outlined circles in the brand colour.
- One screenshot per component, directly under its one-line description, followed by the field table.

## Output

- Overwrite `docs/<Project>-Strapi-How-To-Guide.pdf` in the project repo and bump the version on the cover. Never commit a guide PDF to the starter.
- Report which environment each new screenshot came from and anything you could not capture.
