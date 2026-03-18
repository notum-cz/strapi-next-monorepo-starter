---
sidebar_position: 1
sidebar_label: "Content Model"
description: "Reference for all Strapi content types: fields, relationships, localization status, and component overview."
---

# Content Model

Six content types grouped by purpose. Use this reference to understand fields, localization status, and relationships — check the Strapi admin panel for full field details.

## Quick Reference

| Name        | API UID                          | Kind           | Localized | Draft/Publish |
| ----------- | -------------------------------- | -------------- | --------- | ------------- |
| Page        | `api::page.page`                 | collectionType | Yes       | Yes           |
| Navbar      | `api::navbar.navbar`             | singleType     | Yes       | No            |
| Footer      | `api::footer.footer`             | singleType     | Yes       | No            |
| Redirect    | `api::redirect.redirect`         | collectionType | No        | Yes           |
| Subscriber  | `api::subscriber.subscriber`     | collectionType | No        | No            |
| InternalJob | `api::internal-job.internal-job` | collectionType | No        | No            |

---

## CMS Content

### Page

Primary CMS content type. Each page is a node in a URL hierarchy (e.g., `/about/team`). The `fullPath` is computed by the [internal jobs system](../backend/internal-jobs.md) — it is **not** recalculated automatically. After changing a page's slug or parent, you must manually trigger the recalculation from the Strapi admin panel.

**Schema:** `apps/strapi/src/api/page/content-types/page/schema.json`

| Field             | Type                            | Notes                                                                                               |
| ----------------- | ------------------------------- | --------------------------------------------------------------------------------------------------- |
| `title`           | string                          | Required. Localized.                                                                                |
| `slug`            | string                          | Required. Localized. Regex: `^[a-z0-9/-]+$`.                                                        |
| `fullPath`        | string                          | Localized. Unique. Computed via [internal jobs](../backend/internal-jobs.md) — do not set manually. |
| `breadcrumbTitle` | string                          | Localized. Short label for breadcrumb nav.                                                          |
| `content`         | dynamiczone                     | Localized. Accepts 12 section and form components.                                                  |
| `seo`             | component (`seo-utilities.seo`) | Localized. SEO metadata.                                                                            |
| `parent`          | relation (manyToOne → Page)     | Inverse of `children`.                                                                              |
| `children`        | relation (oneToMany → Page)     | Inverse of `parent`.                                                                                |

**Self-referencing hierarchy:** A page's `parent` determines its URL ancestry. For example, a page with slug `team` whose parent has `fullPath` `/about` gets `fullPath` `/about/team`. See [Pages Hierarchy](../backend/pages-hierarchy.md) for the full recalculation logic.

**Dynamic zone:** The `content` field accepts 12 components from the `sections.*` and `forms.*` categories, plus three `utilities.*` rich-text types. See [Dynamic Zones](#dynamic-zones) below and [Page Builder](../architecture/page-builder.md) for how the frontend renders these.

---

## Navigation

### Navbar

Single global navbar, one entry per locale. No draft/publish — changes go live immediately on publish via Strapi i18n.

**Schema:** `apps/strapi/src/api/navbar/content-types/navbar/schema.json`

| Field       | Type                                    | Notes                                    |
| ----------- | --------------------------------------- | ---------------------------------------- |
| `links`     | component (`utilities.link`)            | Repeatable. Localized. Navigation links. |
| `logoImage` | component (`utilities.image-with-link`) | Localized. Logo with optional link.      |

### Footer

Single global footer, one entry per locale. No draft/publish.

**Schema:** `apps/strapi/src/api/footer/content-types/footer/schema.json`

| Field       | Type                                    | Notes                                                    |
| ----------- | --------------------------------------- | -------------------------------------------------------- |
| `sections`  | component (`elements.footer-item`)      | Repeatable. Localized. Footer column groups.             |
| `links`     | component (`utilities.link`)            | Repeatable. Localized. Footer-level links (e.g., legal). |
| `copyRight` | string                                  | Localized. Copyright notice text.                        |
| `logoImage` | component (`utilities.image-with-link`) | Localized. Footer logo with optional link.               |

---

## System

These three types are not localized. They are infrastructure types, not CMS content.

### Redirect

URL redirect entries. Created by the [internal jobs system](../backend/internal-jobs.md) when a page's `fullPath` changes — requires manually triggering the "Create all redirects" action in the admin panel. Can also be created manually.

**Schema:** `apps/strapi/src/api/redirect/content-types/redirect/schema.json`

| Field         | Type    | Notes                                           |
| ------------- | ------- | ----------------------------------------------- |
| `source`      | string  | Required. The old URL path (e.g., `/old-path`). |
| `destination` | string  | Required. The new URL path (e.g., `/new-path`). |
| `permanent`   | boolean | Default: `false`. `true` = 301, `false` = 302.  |

Draft/Publish is enabled so redirects can be staged before going live.

### Subscriber

Stores contact form and newsletter submissions.

**Schema:** `apps/strapi/src/api/subscriber/content-types/subscriber/schema.json`

| Field     | Type                                   | Notes                                |
| --------- | -------------------------------------- | ------------------------------------ |
| `name`    | string                                 | Submitter name.                      |
| `email`   | email                                  | Submitter email.                     |
| `message` | text                                   | Free-text message.                   |
| `content` | customField (`tiptap-editor.RichText`) | Rich text content (newsletter body). |

### InternalJob

Async background job queue. Not intended for direct editing — jobs are created by page lifecycle hooks and consumed by the admin panel actions.

**Schema:** `apps/strapi/src/api/internal-job/content-types/internal-job/schema.json`

| Field               | Type   | Notes                                                     |
| ------------------- | ------ | --------------------------------------------------------- |
| `jobType`           | enum   | `RECALCULATE_FULLPATH` \| `CREATE_REDIRECT`               |
| `state`             | enum   | `pending` \| `completed` \| `failed`. Default: `pending`. |
| `relatedDocumentId` | string | Strapi document ID of the affected page.                  |
| `targetLocale`      | string | Locale of the affected page.                              |
| `documentType`      | string | Regex-validated: must match `api::page.page`.             |
| `slug`              | string | Slug at time of job creation.                             |
| `payload`           | json   | Arbitrary job data.                                       |
| `error`             | string | Error message if `state = "failed"`.                      |

See [Internal Jobs](../backend/internal-jobs.md) for job lifecycle, handlers, and admin panel actions.

---

## Components Overview

Components are reusable building blocks shared across content types. They are not standalone content types — they must be embedded in a content type field or dynamic zone.

| Category        | Count | Included In                      |
| --------------- | ----- | -------------------------------- |
| `sections`      | 7     | Page dynamiczone                 |
| `forms`         | 2     | Page dynamiczone                 |
| `utilities`     | 10    | Page dynamiczone, Navbar, Footer |
| `seo-utilities` | 4     | Page `seo` field                 |
| `elements`      | 1     | Footer `sections` field          |

**sections components:** hero, faq, carousel, animated-logo-row, horizontal-images, image-with-cta-button, heading-with-cta-button

**forms components:** contact-form, newsletter-form

**utilities components:** ck-editor-content, ck-editor-text, tip-tap-rich-text, link, link-decorations, links-with-title, basic-image, image-with-link, text, accordions

**seo-utilities components:** seo, seo-og, seo-twitter, social-icons

**elements components:** footer-item

For full schema definitions (fields, required, types) see [Strapi Schemas](../backend/schemas.md).

---

## Dynamic Zones

The `Page.content` field is a dynamic zone that allows any combination of 12 components in any order:

- 7 from `sections.*` (layout and visual sections)
- 2 from `forms.*` (contact and newsletter forms)
- 3 from `utilities.*` (rich text editors: ck-editor-content, ck-editor-text, tip-tap-rich-text)

The frontend uses a component registry to map each Strapi component UID to a React component. See [Page Builder](../architecture/page-builder.md) for how the registry works and how to add new components.
