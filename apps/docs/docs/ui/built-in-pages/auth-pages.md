---
sidebar_position: 1
---

# Auth Pages

Route group: `/auth`

The UI ships with a small set of Better Auth pages under the localized auth route group:

| Route                           | File                                                             | Purpose                             |
| ------------------------------- | ---------------------------------------------------------------- | ----------------------------------- |
| `/auth`                         | `apps/ui/src/app/[locale]/auth/page.tsx`                         | Authenticated user overview.        |
| `/auth/signin`                  | `apps/ui/src/app/[locale]/auth/signin/page.tsx`                  | Sign-in form.                       |
| `/auth/signout`                 | `apps/ui/src/app/[locale]/auth/signout/page.tsx`                 | Sign-out flow.                      |
| `/auth/register`                | `apps/ui/src/app/[locale]/auth/register/page.tsx`                | Registration form.                  |
| `/auth/activate`                | `apps/ui/src/app/[locale]/auth/activate/page.tsx`                | Account activation flow.            |
| `/auth/forgot-password`         | `apps/ui/src/app/[locale]/auth/forgot-password/page.tsx`         | Forgot-password request form.       |
| `/auth/reset-password`          | `apps/ui/src/app/[locale]/auth/reset-password/page.tsx`          | Password reset flow.                |
| `/auth/change-password`         | `apps/ui/src/app/[locale]/auth/change-password/page.tsx`         | Authenticated password change flow. |
| `/auth/strapi-oauth/[provider]` | `apps/ui/src/app/[locale]/auth/strapi-oauth/[provider]/page.tsx` | Strapi OAuth callback handling.     |

These pages are request-time pages because auth depends on cookies, headers, session state, and redirects.

For the full auth model, see [Authentication](../../auth/ui/authentication.md).
