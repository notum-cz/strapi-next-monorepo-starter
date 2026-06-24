---
sidebar_position: 11
---

# remove-sentry

Remove Sentry error tracking from both the frontend and Strapi while keeping structured logging in place. Only the error-reporting backend goes — your logging keeps working.

## Use it when

- You don't use Sentry and want it and its configuration removed cleanly.

## What it helps solve

- Removes an unused Sentry account dependency.
- Simplifies error-tracking setup when the project uses another tool or none.
- Keeps regular application logging in place.

Use [remove-azure-monitor](./remove-azure-monitor.md) separately if Azure telemetry should also go.
