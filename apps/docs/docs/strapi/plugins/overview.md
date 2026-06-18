---
sidebar_position: 1
slug: /strapi/strapi-plugins
---

# Strapi Plugins

Plugin configuration lives in `apps/strapi/config/plugins.ts`, with larger plugin configs split under `apps/strapi/config/plugins`.

Defaults are enabled for `users-permissions`, `sentry`, `config-sync`, `tiptap-editor`, and `smart-populate`. Upload and email providers auto-select based on available environment variables.

## Plugin Docs

| Doc                                                      | Covers                                                   |
| -------------------------------------------------------- | -------------------------------------------------------- |
| [Users Permissions](./users-permissions.md)              | JWT lifetime and auth docs.                              |
| [Config Sync](./config-sync.md)                          | Version-controlled roles, permissions, and settings.     |
| [CKEditor](./ckeditor.md)                                | HTML rich-text editing and UI rendering.                 |
| [Tiptap Editor](./tiptap-editor.md)                      | Structured rich-text editing, presets, and rendering.    |
| [Smart Population](./smart-populate.md)                  | Schema-generated deep population for components.         |
| [Upload Providers](./upload-providers.md)                | Local, Azure Blob Storage, and AWS S3 upload selection.  |
| [Email Providers](./email-providers.md)                  | Mailgun production email and Mailtrap development email. |
| [Sentry](../../reference/integrations/logging.md#sentry) | UI and Strapi error tracking.                            |

Cron tasks are configured separately from plugins. See [Cron Jobs](../cron-jobs.md).

## Related Documentation

- [Authentication](../../auth/ui/authentication.md) — Better Auth + JWT
- [OAuth Providers](../../auth/ui/oauth-providers.md) — GitHub/Google/Facebook setup via users-permissions
- [Microsoft SSO](../../auth/strapi-admin/microsoft-sso.md) — admin panel SSO
- [Strapi Schemas](../strapi-schemas.md) — content type/component reference
- [Data Seeding](../data-seeding.md) — seed export/import workflow
