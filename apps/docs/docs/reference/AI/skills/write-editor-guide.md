---
sidebar_position: 28
---

# write-editor-guide

Build or update `docs/<Project>-Strapi-How-To-Guide.pdf`, the customer-facing Strapi guide for the client's content team. The guide explains Strapi basics, creating pages, every page-builder section with a screenshot, SEO, the Media Library, navbar and footer, redirects, form submissions and troubleshooting.

The skill keeps the HTML source in `.claude/skills/write-editor-guide/template/guide.html`, so each run edits the previous version instead of rewriting it. The starter ships a generic template that covers the starter's components. On the first run in a project, the skill fills in the project name, brand colours, fonts and logo, and adds the project's own components. Its scripts find which page uses each component, screenshot the sections on stg or dev, and render the branded PDF (project & Strapi cover, project, Strapi and Notum logos in the footer).

## Use it when

- A release ships new or changed page-builder sections and the client needs an updated guide.
- The client asks how to do something in Strapi that the guide does not cover yet.
- Screenshots in the guide are outdated or broken.

## What it helps solve

- Reads schemas from the branch that ships to PROD instead of a stale local branch.
- Avoids known screenshot traps: asset hosts that block the headless browser user agent, sticky elements that belong to the content, and test copy on test pages.
- Keeps the agreed visual style consistent between versions.

See also: [Page Builder](../../../page-builder/introduction.md), `agent-browser`.
