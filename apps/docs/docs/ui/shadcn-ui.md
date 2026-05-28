# shadcn/ui

The UI app ships with shadcn/ui components in:

```txt
apps/ui/src/components/ui
```

These files are generated and updated by the shadcn CLI, so keep their names and folder structure intact.

Add new components with:

```bash
pnpm dlx shadcn@latest add accordion
```

Config lives in [`components.json`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/ui/components.json). Theme tokens live in [`src/styles/globals.css`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/ui/src/styles/globals.css) and `@repo/design-system/theme.css`.

Use `cn()` from [`src/lib/styles.ts`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/ui/src/lib/styles.ts) when merging Tailwind classes:

```tsx
import { cn } from "@/lib/styles"
;<div className={cn("flex items-center", className)} />
```
