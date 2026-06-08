---
sidebar_position: 0
slug: /auth
---

# Authentication

The starter has two separate authentication surfaces:

| Surface                                             | Users                           | App           | Purpose                                                                                     |
| --------------------------------------------------- | ------------------------------- | ------------- | ------------------------------------------------------------------------------------------- |
| [UI Authentication](./ui/authentication.md)         | End-users of the website or app | `apps/ui`     | Sign in, register, reset password, OAuth login, and access user-specific frontend features. |
| [Strapi Admin SSO](./strapi-admin/microsoft-sso.md) | CMS editors and administrators  | `apps/strapi` | Sign in to the Strapi admin panel to manage content and CMS settings.                       |

:::warning Keep these separate
End-user authentication is not Strapi admin authentication. A visitor account in the UI does not grant access to the CMS admin panel, and a Strapi admin user is not the same as an end-user account.
:::

## End-User Authentication

UI Authentication uses Better Auth for the session cookie and Strapi Users & Permissions for the user JWT. The UI stores the Strapi JWT in the Better Auth session and uses it for authenticated user-facing API calls.

Start here when you are working on website/app sign-in, registration, password reset, OAuth login, or user-specific frontend data.

## Strapi Admin Authentication

Strapi Admin SSO is for CMS users who log into `/admin`. In this starter, Microsoft SSO authenticates Strapi admin users through Microsoft Entra ID, while Strapi still controls admin roles and permissions.

Start here when you are working on CMS editor/admin login.

## Related Documentation

- [UI Authentication](./ui/authentication.md)
- [Microsoft SSO](./strapi-admin/microsoft-sso.md)
