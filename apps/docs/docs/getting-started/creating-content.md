---
sidebar_position: 5
sidebar_label: "Creating Content"
description: "Create a new page using the page builder and preview draft content."
---

# Creating Content

## 1. Create a new page

In Strapi admin, go to **Content Manager** > **Pages** > **Create new entry**.

## 2. Fill required fields

| Field      | Required | Description                                                                                 |
| ---------- | -------- | ------------------------------------------------------------------------------------------- |
| `title`    | Yes      | Page title (used in metadata and headings)                                                  |
| `slug`     | Yes      | URL-safe identifier for the page                                                            |
| `fullPath` | Jobs     | Computed via [internal jobs](../backend/internal-jobs.md) — trigger manually in admin panel |

Pages support a parent-child hierarchy. Setting a `parent` page determines URL ancestry (e.g., parent slug `services` + child slug `consulting` produces `/services/consulting`). The `fullPath` is **not** recalculated automatically — after changing a slug or parent, trigger the "Recalculate all fullpaths" action in the [Internal Jobs](../backend/internal-jobs.md) admin panel.

## 3. Add components to the dynamic zone

The `content` field is a **dynamic zone** -- Strapi's page builder pattern. Click **Add a component** to choose from the available component categories:

| Category          | Examples                                      | Purpose                     |
| ----------------- | --------------------------------------------- | --------------------------- |
| **Sections**      | Hero, text with image, CTA, cards grid        | Full-width page sections    |
| **Forms**         | Contact form, newsletter signup               | Interactive form components |
| **Elements**      | Button, link, badge                           | Atomic UI elements          |
| **Utilities**     | Rich text (CKEditor/Tiptap), image, link list | Content primitives          |
| **SEO Utilities** | Structured data (JSON-LD)                     | Search engine metadata      |

Each component you add appears in the dynamic zone as an ordered block. Drag to reorder, expand to edit, or remove as needed.

## 4. Save and publish

Click **Save** to create the page as a draft. Click **Publish** to make it live.

## 5. View the page

Navigate to the page URL in the Next.js frontend: `http://localhost:3000/{slug}` (or `http://localhost:3000/{parent-slug}/{slug}` for nested pages).

:::tip
For a deep dive into how the page builder works -- component registry, populate configs, and adding custom components -- see the [Page Builder Architecture](pathname://../architecture/page-builder).
:::

## Preview mode

Strapi supports previewing draft (unpublished) content in the Next.js frontend without publishing.

**Requirements:**

- `STRAPI_PREVIEW_ENABLED=true` in `apps/strapi/.env`
- `STRAPI_PREVIEW_SECRET` set to the same value in both `apps/strapi/.env` and `apps/ui/.env.local`

**Flow:**

1. In Strapi admin, open a draft page
2. Click **Open preview**
3. Strapi redirects to the Next.js preview API route with a signed token
4. Next.js enters draft mode and fetches the unpublished version of the page
5. The draft content is rendered in the frontend with a preview indicator

:::note
Preview mode uses Next.js Draft Mode under the hood. The shared secret ensures only Strapi admin can trigger draft rendering.
:::
