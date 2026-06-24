---
sidebar_position: 2
---

# `@repo/shared-data`

Small runtime package for code shared by the UI and Strapi apps.

Use it for values, functions, and constants that must behave the same in both runtimes. Anything that is safe to share between `apps/ui` and `apps/strapi` can be exported from here.

This avoids duplicating small but important behavior, for example path normalization used by both page hierarchy logic and UI navigation.

## Build

`pnpm --filter @repo/shared-data build` runs `tsc` and emits `dist/index.js` plus declarations.

:::tip Troubleshooting
Build the apps through Turbo, for example `pnpm build`, `pnpm dev`, or the app-specific root scripts. `@repo/shared-data` is a prerequisite for the UI and Strapi apps, so its `dist/` output has to exist before those apps import it.
:::
