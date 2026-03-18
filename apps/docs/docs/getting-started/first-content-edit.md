---
sidebar_position: 4
sidebar_label: "First Content Edit"
description: "Edit an existing page in Strapi admin and see the change in the frontend."
---

# First Content Edit

Assumes Strapi and Next.js are running from the [previous step](./running-the-project.md).

## 1. Open Strapi admin

Navigate to [http://localhost:1337/admin](http://localhost:1337/admin) and log in with the admin account you created.

## 2. Navigate to Content Manager

In the left sidebar, click **Content Manager**. You will see the list of collection types and single types.

## 3. Open a page

Click **Pages** in the collection type list. Open an existing page (e.g., the home page).

## 4. Edit content

The page's `content` field is a **dynamic zone** -- an ordered list of components. Each component represents a section of the page (hero, text block, form, etc.).

Click on any component in the dynamic zone to expand it. Edit a text field or modify a component's properties.

## 5. Save and publish

Click **Save** to persist your changes as a draft. Then click **Publish** to make the changes live.

## 6. View in the frontend

Open [http://localhost:3000](http://localhost:3000) and navigate to the page you edited. Refresh the browser to see the updated content.

:::note
**ISR revalidation behavior:**

- **Dev mode:** Changes appear on page refresh immediately.
- **Production:** Pages use Incremental Static Regeneration with a 300-second (5-minute) revalidation window. After publishing in Strapi, the frontend may serve the cached version for up to 5 minutes before fetching fresh content.
  :::
