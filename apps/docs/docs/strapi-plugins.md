# Strapi Plugins

Plugin configuration lives in [`apps/strapi/config/plugins.ts`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/strapi/config/plugins.ts) with per-plugin splits under [`config/plugins/`](https://github.com/notum-cz/strapi-next-monorepo-starter/tree/main/apps/strapi/config/plugins). Defaults are enabled for `users-permissions`, `sentry`, `config-sync`, `tiptap-editor`. Upload and email providers auto-select based on env vars present.

## users-permissions

JWT expiry is set to **30 days** to match the Better Auth session `maxAge` ([`plugins.ts:14`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/strapi/config/plugins.ts#L14)). Change both together or sessions and JWTs will desync.

See [Authentication](./authentication.md) for the full auth flow.

## config-sync

[`strapi-plugin-config-sync`](https://www.npmjs.com/package/strapi-plugin-config-sync) — version-controlled Strapi configuration (roles, permissions, settings) synced to JSON files. Enable defaults. To sync after install:

1. Strapi admin → Settings → Config Sync → Tools
2. Click **Import**

Commit the generated `config/sync/` files.

## Rich Text Editors

Two editors ship together — pick per-component based on whether you need HTML or structured JSON output. Both render via dedicated frontend components.

### CKEditor (`@_sh/strapi-plugin-ckeditor`)

HTML-based. Content stored as HTML and rendered via `dangerouslySetInnerHTML` with link processing and sanitization.

**Strapi components:** `utilities.ck-editor-content`, `utilities.ck-editor-text` (different toolbars, same rendering).

**Frontend:**

```tsx
import CkEditorRenderer from "@/components/elementary/ck-editor"

<CkEditorRenderer
  htmlContent={component.content}
  className="mx-auto w-full max-w-[1296px] px-4 py-8"
  variant="page" // "page" | "blog"
/>
```

Custom CKEditor plugins and heading styles: [`apps/strapi/src/admin/ckeditor/`](https://github.com/notum-cz/strapi-next-monorepo-starter/tree/main/apps/strapi/src/admin/ckeditor).

### Tiptap (`@notum-cz/strapi-plugin-tiptap-editor`)

JSON-based (ProseMirror). Frontend renders via `@tiptap/static-renderer` with full node/mark control.

:::warning
Plugin still in early stages. Stable for basic use; report issues to [strapi-plugin-tiptap-editor](https://github.com/notum-cz/strapi-plugin-tiptap-editor/issues).
:::

**Strapi component:** `utilities.tip-tap-rich-text`.

**Presets** ([`config/plugins/tiptap.ts`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/strapi/config/plugins/tiptap.ts)):

| Preset | Description |
| --- | --- |
| `everything` | All extensions — headings (1–6), color, highlight, images, tables, alignment, lists, code, sub/super |
| `baseText` | Bold, italic, links, lists. Paragraph content. |
| `headings` | Bold, italic, heading only. For heading components with SEO tags. |
| `minimal` | Bold, italic, links only. |

Assign per-field via `options.preset` in the component schema (e.g. `tip-tap-rich-text.json`).

Colors and theme CSS come from `@repo/design-system/tiptap-color-config.json` and `tiptap-theme.css` — the editor palette stays in sync with the frontend design system. See [Packages](./packages.md#repodesign-system).

**Frontend:**

```tsx
import { TiptapRichText } from "@/components/elementary/tiptap-editor"

<TiptapRichText
  content={component.content}
  defaultVariant="medium"
  defaultWeight="normal"
  accentCursive="accent-cursive" // "accent-cursive" | "only-cursive" | "no-accent"
/>
```

**Renderer supports:** bold, italic, underline, strike, text color, highlight, headings (1–6), links, images (aligned), blockquotes, ordered/unordered lists, tables, code blocks, sub/superscript, text alignment.

## Upload Providers

Config in [`config/plugins/upload.ts`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/strapi/config/plugins/upload.ts). Resolution priority: **Azure Blob Storage → AWS S3 → local**. The first provider whose required env vars are present wins.

### Azure Blob Storage (`strapi-provider-upload-azure-storage`)

Required env vars (set all):

| Var | Purpose |
| --- | --- |
| `STORAGE_ACCOUNT` | Azure storage account name |
| `STORAGE_CONTAINER_NAME` | container name |
| `STORAGE_ACCOUNT_KEY` or `STORAGE_ACCOUNT_SAS_TOKEN` | credentials (when `STORAGE_AUTH_TYPE=default`) |
| `STORAGE_AUTH_TYPE=msi` | Managed Identity — assign **Storage Blob Data Contributor** RBAC role instead of providing keys |

Configure Blob service CORS to allow `GET`, `HEAD`, `OPTIONS` from the Strapi admin origin. Without this, media appears in the gallery but fails in the admin modal.

CSP: the Azure Blob domain (`*.blob.core.windows.net`) is whitelisted in [`config/middlewares.ts`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/strapi/config/middlewares.ts) (`media-src`, `img-src`). Add custom `STORAGE_URL` or `STORAGE_CDN_URL` domains there if you use them.

### AWS S3 (`@strapi/provider-upload-aws-s3`)

Required env vars: `AWS_ACCESS_KEY_ID`, `AWS_ACCESS_SECRET`, `AWS_REGION`, `AWS_BUCKET`.

:::tip
On Heroku always use S3 (or another external store). Dyno restarts delete local uploads.
:::

CSP: `*.amazonaws.com` is whitelisted in [`config/middlewares.ts`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/strapi/config/middlewares.ts). Add `CDN_URL` host if you use a CDN.

## Email Providers

Config in [`config/plugins/email.ts`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/strapi/config/plugins/email.ts). Mailgun has priority; Mailtrap is the dev fallback. Selection based on which env vars are present.

### Mailgun (`@strapi/provider-email-mailgun`)

Production default. Set:

```bash
MAILGUN_API_KEY=
MAILGUN_DOMAIN=
MAILGUN_EMAIL=             # from + reply-to
MAILGUN_HOST=https://api.eu.mailgun.net
```

### Mailtrap (`@strapi/provider-email-nodemailer`)

Dev/testing. Captures emails in a Mailtrap inbox without sending. Set:

```bash
MAILTRAP_USER=
MAILTRAP_PASS=
MAILTRAP_HOST=sandbox.smtp.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_EMAIL=            # from + reply-to
```

Restart Strapi after setting.

**Caveat:** without an email provider configured, user registration may fail because the `afterCreate` lifecycle in [`src/lifeCycles/user.ts`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/strapi/src/lifeCycles/user.ts) sends an account activation email. Either disable the lifecycle or configure email before enabling registration.

## Sentry (`@strapi/plugin-sentry`)

Set `SENTRY_DSN`. Runs in production only by default — change in [`config/plugins.ts:23`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/strapi/config/plugins.ts#L23) if you want it active in dev.

Use Sentry inside controllers/services:

```ts
async find(ctx) {
  // Uncaught errors auto-log to Sentry
  throw new Error("Not implemented")

  const sentry = strapi.plugin("sentry").service("sentry")
  sentry.sendError(new Error("My custom error"))

  const instance = sentry.getInstance()
  instance?.captureMessage("My custom message")
}
```

`instance` is `undefined` when Sentry is disabled (dev). Always optional-chain.

Strapi-side Sentry docs: [docs.strapi.io/dev-docs/plugins/sentry](https://docs.strapi.io/dev-docs/plugins/sentry).

## Cron Jobs

Defined in [`config/cron-tasks.ts`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/strapi/config/cron-tasks.ts). Enable with `CRON_ENABLED=true`.

## Related Documentation

- [Authentication](./authentication.md) — Better Auth + JWT
- [OAuth Providers](./sso/oauth-providers.md) — GitHub/Google/Facebook setup via users-permissions
- [Microsoft SSO](./sso/microsoft-sso.md) — admin panel SSO
- [Strapi Schemas](./strapi-schemas.md) — content type/component reference
- [Data Seeding](./data-seeding.md) — seed export/import workflow
