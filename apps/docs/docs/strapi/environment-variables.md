---
sidebar_position: 2
---

# Environment Variables

Strapi environment config lives in:

```txt
apps/strapi/.env
apps/strapi/.env.example
apps/strapi/config
```

This starter extends Strapi's default environment variables. See the official [Strapi Environment Variables docs](https://docs.strapi.io/cms/configurations/environment).

:::warning
Do not leave empty values such as `DATABASE_PASSWORD=` in `.env`. Empty values are treated as set, so default config fallbacks will not be used. Remove or comment the line when you want the default.
:::

## Reference

<style>
{`
table th:first-child,
table td:first-child {
  width: 40%;
}

table td:first-child code {
  overflow-wrap: anywhere;
  white-space: normal;
}
`}
</style>

| Var                                       | Required                                    | Used by                                                                                                                                        |
| ----------------------------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `HOST`                                    | No                                          | Server bind host. Defaults to `0.0.0.0`.                                                                                                       |
| `PORT`                                    | No                                          | Server port. Defaults to `1337`.                                                                                                               |
| `APP_URL`                                 | Production                                  | Public Strapi URL; admin links; SSO callback URLs.                                                                                             |
| `APP_KEYS`                                | Yes                                         | Strapi session cookie signing keys.                                                                                                            |
| `API_TOKEN_SALT`                          | Yes                                         | Strapi API token signing salt.                                                                                                                 |
| `ADMIN_JWT_SECRET`                        | Yes                                         | Strapi admin JWT secret.                                                                                                                       |
| `JWT_SECRET`                              | Yes                                         | Users & Permissions JWT secret.                                                                                                                |
| `TRANSFER_TOKEN_SALT`                     | When transfer is used                       | Strapi transfer token signing salt.                                                                                                            |
| `CRON_ENABLED`                            | No                                          | Enables Strapi cron tasks. See [Cron Jobs](./cron-jobs.md).                                                                                    |
| `WEBHOOKS_POPULATE_RELATIONS`             | No                                          | Enables populated relations in Strapi webhooks.                                                                                                |
| `STRAPI_MCP_ENABLED`                      | No                                          | Toggles the built-in MCP server at `/mcp` (default `true` in development, `false` elsewhere). See [Strapi MCP](../reference/AI/strapi-mcp.md). |
| `AUTO_SEED_ENABLED`                       | No                                          | Enables automatic seed import before Strapi starts. See [Data Seeding](./data-seeding.md).                                                     |
| `AUTO_SEED_MODE`                          | No                                          | Controls automatic seed behavior: `empty`, `prompt`, `force`, or `skip`.                                                                       |
| `STRAPI_LICENSE`                          | When licensed features are used             | Strapi license key.                                                                                                                            |
| `DATABASE_URL`                            | Production or hosted DB                     | Full database connection string; has priority over individual database fields.                                                                 |
| `DATABASE_CLIENT`                         | Yes                                         | Database client, usually `postgres`.                                                                                                           |
| `DATABASE_HOST`                           | Yes without `DATABASE_URL`                  | Database host.                                                                                                                                 |
| `DATABASE_PORT`                           | Yes without `DATABASE_URL`                  | Database port.                                                                                                                                 |
| `DATABASE_NAME`                           | Yes without `DATABASE_URL`                  | Database name.                                                                                                                                 |
| `DATABASE_USERNAME`                       | Yes without `DATABASE_URL`                  | Database username.                                                                                                                             |
| `DATABASE_PASSWORD`                       | Yes without `DATABASE_URL`                  | Database password.                                                                                                                             |
| `DATABASE_SSL`                            | Production                                  | Enables database SSL.                                                                                                                          |
| `DATABASE_SCHEMA`                         | No                                          | PostgreSQL schema. Defaults to `public`.                                                                                                       |
| `DATABASE_POOL_MIN` / `DATABASE_POOL_MAX` | No                                          | Database pool limits.                                                                                                                          |
| `DATABASE_CONNECTION_TIMEOUT`             | No                                          | Database connection timeout.                                                                                                                   |
| `TEST_DATABASE_FILENAME`                  | Tests                                       | SQLite filename for test setups.                                                                                                               |
| `SENTRY_DSN`                              | When Sentry is used                         | Strapi-side error tracking. See [Observability → Sentry](../reference/integrations/logging.md#sentry).                                         |
| `LOG_LEVEL`                               | No                                          | Log verbosity for structured logging. See [Observability](../reference/integrations/logging.md).                                               |
| `OTEL_SERVICE_NAME`                       | No                                          | OpenTelemetry service name on logs/spans (default `strapi`).                                                                                   |
| `APPLICATIONINSIGHTS_CONNECTION_STRING`   | When Azure Monitor is used                  | Enables the Azure Monitor telemetry provider. Inert when unset.                                                                                |
| `CLIENT_URL`                              | Preview and frontend links                  | Frontend base URL; preview links; admin CORS allowed origin.                                                                                   |
| `STRAPI_PREVIEW_ENABLED`                  | No                                          | Enables Strapi Preview button configuration.                                                                                                   |
| `STRAPI_PREVIEW_SECRET`                   | When preview is enabled                     | Shared secret for Strapi Preview and the UI preview route. See [Strapi Preview](./strapi-preview.md).                                          |
| `CLIENT_ACCOUNT_ACTIVATION_URL`           | When account activation emails are used     | Frontend account activation link in backend email templates.                                                                                   |
| `ADMIN_PANEL_CONFIG_API_AUTH_TOKEN`       | When admin runtime config injection is used | Protects the custom admin panel config endpoint.                                                                                               |

:::info Provider and plugin variables
Additional environment variables depend on enabled Strapi plugins and providers. See [Upload Providers](./plugins/upload-providers.md), [Email Providers](./plugins/email-providers.md), [Strapi Preview](./strapi-preview.md), [Microsoft SSO](../auth/strapi-admin/microsoft-sso.md), and [Observability](../reference/integrations/logging.md).
:::
