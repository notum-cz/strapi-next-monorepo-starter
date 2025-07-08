# Shared Design System

This package provides shared design tokens and styles for both applications in this monorepo:

- **Frontend:** Next.js app
- **Backend:** Strapi CMS (with CKEditor integration)

By sharing design tokens and styles, we ensure WYSIWYG editing (especially inside CKEditor) closely matches the frontend design.

---

## Why This Package?

Tailwind v4 builds its config directly from CSS, not JS/TS. Strapi's CSS injection is limited and does not recognize Tailwind directives. This package bridges that gap by providing pre-built CSS and JSON config files for both apps.

---

## Usage

### Next.js

- **Theme Import:**  
  Import the theme in your global CSS (e.g., `styles/globals.css`):
  ```css
  @import "@repo/design-system/theme.css";
  ```
- **Styles Import:**  
  Optionally, import the base styles:
  ```css
  @import "@repo/design-system/styles.css";
  ```

### Strapi

- **Styles Injection:**  
  Inject the compiled styles in `apps/strapi/src/admin/app.tsx`:
  ```js
  import s from "@repo/design-system/styles-strapi.json"
  ```
  This is a serialized string, because you cannot simply inject CSS into Strapi Admin. (at the time of writing)
- **CKEditor Config:**  
  Use the generated JSON configs for CKEditor color and font size:
  - `@repo/design-system/ck-color-config.json`
  - `@repo/design-system/ck-fontSize-config.json`

---

## Exports

| Export Path                                   | Description                                  |
| --------------------------------------------- | -------------------------------------------- |
| `@repo/design-system/theme.css`               | Raw Tailwind theme (with directives)         |
| `@repo/design-system/styles.css`              | Compiled CSS (for both Next.js and Strapi)   |
| `@repo/design-system/styles-strapi.json`      | JSON with all CSS variables for Strapi       |
| `@repo/design-system/custom-styles.css`       | Custom styles for CKEditor                   |
| `@repo/design-system/ck-color-config.json`    | CKEditor color config (JSON, for Strapi)     |
| `@repo/design-system/ck-fontSize-config.json` | CKEditor font size config (JSON, for Strapi) |

---

## Development

- **Modify tokens or styles:**  
  Edit files in `src/`.

  - Changes in Next.js are picked up immediately.
  - For Strapi, rebuild the package and restart the dev server.

- **Build:**
  ```bash
  yarn build
  ```
  This runs Tailwind to generate `dist/styles.css` and builds CKEditor configs.

---

## How CKEditor Configs Are Built

The script `src/build-ck-config.js`:

- Loads the theme file.
- Extracts all color and font size variables (must be prefixed with `--color` or `--text`).
- Generates JSON configs for CKEditor.

**Note:**  
CKEditor font sizes must use pixel values (not CSS variables), so changes to font sizes may not be responsive in Strapi.
