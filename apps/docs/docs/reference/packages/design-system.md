---
sidebar_position: 1
---

# `@repo/design-system`

Shared Tailwind v4 theme package. It contains the source CSS variables and builds the CSS and editor configuration files used by the UI and Strapi admin.

## Exports

| Export                       | Purpose                                                       |
| ---------------------------- | ------------------------------------------------------------- |
| `./theme.css`                | Source theme variables.                                       |
| `./custom-styles.css`        | Additional handwritten CSS.                                   |
| `./styles.css`               | Compiled Tailwind output.                                     |
| `./tiptap-theme.css`         | Tiptap theme override.                                        |
| `./tiptap-color-config.json` | Color palette for the Tiptap editor.                          |
| `./ck-color-config.json`     | Color palette for CKEditor.                                   |
| `./ck-fontSize-config.json`  | Font-size options for CKEditor.                               |
| `./styles-strapi.json`       | Compiled CSS string injected into Strapi's CKEditor instance. |

## Build

The package builds Tailwind CSS and then generates editor config from the compiled design tokens:

```bash
tailwindcss -i ./src/styles.css -o ./dist/styles.css
node ./src/build-ck-config.js
node ./src/build-tiptap-config.js
```

Turbo makes local development depend on this build so both apps receive current design tokens.

:::tip Troubleshooting
Build the apps through Turbo, for example `pnpm build`, `pnpm dev`, or the app-specific root scripts. `@repo/design-system` is a prerequisite for the UI and Strapi apps, so its `dist/` output has to exist before those apps import compiled styles or editor config.
:::
