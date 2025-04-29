# Shared Design Package

This package exists to share design tokens between two separate applications:

- Frontend: Next.js app
- Backend: Strapi CMS (with CKEditor integration)

By sharing design tokens across both apps, we ensure that WYSIWYG editing (especially inside CKEditor) accurately matches the frontend design.

## Why This Package?

Tailwind's v4 introduced changes that affect how it's config is built. It's no longer a JS/TS file, but it's built directly from CSS. This poses a slight issue, as Strapi CSS injection is quite limited, and it does not recognize Tailwind's directives. Therefore we do the certain modifications in this package.

## I want to modify the config, what should I do?

Firstly, make sure you are modifying within the `src` folder! Changes to this config within NextJS should propagate immediately.

On the other hand, Strapi will not respect these changes, and it will require a reload of the dev server, which should trigger build of this package.

Adding new tokens should also be propagated to CkEditor after building the package and restarting the server, thanks to the `build-ck-config.js` script.

## Exports from this package

- `styles.css` - can contain custom styles, but for the time being it only includes default tailwind styles (can be included in non-TW apps, such as Strapi)
- `theme.css` - raw Tailwind theme (with directives)
- `ck-color-config.json` - contains a JSON object that includes vars of all the colors required for CkEditor config
- `ck-fontSize-config.json` - contains a JSON object that includes CkEditor configuration for font sizes
  - Warning: This does not work with variables (as CkEditor ignores them), which is why we need to use pixel values. Any changes to the font sizes will not work, and it will not be responsive in Strapi.

## Process

### Next

Next includes Tailwind, therefore it does not need any additional configuration beyond the default import.

Theme from this package should be included in `styles/globals.css` file using the `@import` diretive.

### Strapi

In order to use the theme inside Strapi, we inject the `styles.css` file within the `apps/strapi/src/admin/app.tsx` file.

#### build-ck-color-config

This script simply loads the theme file, identifies all color and font size variables (they must be prefixed with `--color` or `--text` strings respectively), and builds CkEditor Color and Font Size Config.
