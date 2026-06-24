---
sidebar_position: 2
---

# add-content-type

Create a new content type — a new kind of CMS record with its own admin screens and API — and wire it into the app so the frontend can fetch it. You describe the entity (say, a blog post with a title and body) and the skill sets up the model, the API, and the data hookup.

## Use it when

- You need a new editor-managed entity the app reads — blog posts, authors, products, events.
- You want it available in the admin and over the API without hand-wiring each piece.

Use [create-content-component](./create-content-component.md) for page-builder sections and [add-ui-component](./add-ui-component.md) for generic interface elements.

## What it helps solve

- Gives editors a dedicated place to manage a new kind of content.
- Makes content available to the site without hand-building every connection.
- Keeps new content types consistent with the rest of the starter.

Use [strapi-schema-check](./strapi-schema-check.md) when changing an existing content type.

See also: [Add Content Type](../../../getting-started/add-content-type.md), [Strapi Schemas](../../../strapi/strapi-schemas.md).
