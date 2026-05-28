# Error Handling

The UI has two error-boundary layers:

| Layer                | File                                                                                                                                                                       | Catches                                                                                                                                                            |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Route-level boundary | [`src/app/[locale]/error.tsx`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/ui/src/app/%5Blocale%5D/error.tsx)                                  | Rendering and lifecycle errors at the route segment. Next.js [error.tsx convention](https://nextjs.org/docs/app/building-your-application/routing/error-handling). |
| Component-level      | [`ErrorBoundary`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/ui/src/components/elementary/ErrorBoundary.tsx) (`react-error-boundary` wrapper) | Smaller subtrees. Page-builder components are wrapped so one bad CMS entry does not blank the page.                                                                |

Use the component boundary around risky isolated UI:

```tsx
import { ErrorBoundary } from "@/components/elementary/ErrorBoundary"
;<ErrorBoundary customErrorTitle="Uh-oh" showErrorMessage>
  <StrapiNavbar />
</ErrorBoundary>
```

Async errors and event-handler errors are not caught by React boundaries. Handle those with `try/catch` or the error API of your data-fetching tool.
