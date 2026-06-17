---
sidebar_position: 12
---

# Error Handling

The UI has two error-boundary layers:

Base path: `apps/ui/src`

| Layer                | File                                      | Catches                                                                                                                                                            |
| -------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Route-level boundary | `app/[locale]/error.tsx`                  | Rendering and lifecycle errors at the route segment. Next.js [error.tsx convention](https://nextjs.org/docs/app/building-your-application/routing/error-handling). |
| Component-level      | `components/elementary/ErrorBoundary.tsx` | Smaller subtrees. Page-builder components are wrapped so one bad CMS entry does not blank the page.                                                                |

The component-level boundary wraps [`react-error-boundary`](https://github.com/bvaughn/react-error-boundary) with project-specific fallback UI and Sentry reporting.

Use the component boundary around risky isolated UI:

```tsx
import { ErrorBoundary } from "@/components/elementary/ErrorBoundary"

return (
  <ErrorBoundary customErrorTitle="Uh-oh" showErrorMessage>
    <StrapiNavbar />
  </ErrorBoundary>
)
```

Async errors and event-handler errors are not caught by React boundaries. Handle those with `try/catch` or the error API of your data-fetching tool.

## Related Documentation

- [Observability → Sentry](../reference/integrations/logging.md#sentry) — UI and Strapi error tracking.
