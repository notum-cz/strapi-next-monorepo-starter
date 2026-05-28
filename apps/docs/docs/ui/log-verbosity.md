# Log Verbosity

Debug flags are off by default. Enable them per environment in `.env.local`.

Recommended setup: on during local development, off in production.

| Flag                             | Effect                                                                                                                                                                                        |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DEBUG_STATIC_PARAMS_GENERATION` | Logs the output of `generateStaticParams()` so missing or duplicate routes surface during build.                                                                                              |
| `SHOW_NON_BLOCKING_ERRORS`       | Surfaces caught-but-ignored errors. Useful for `fetch` failures that return empty arrays via filters.                                                                                         |
| `DEBUG_STRAPI_CLIENT_API_CALLS`  | Logs every Strapi client request URL, errors, and stack trace from [`base.ts:79`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/ui/src/lib/strapi-api/base.ts#L79). |

Example output when `DEBUG_STRAPI_CLIENT_API_CALLS=true`:

```text
[BaseStrapiClient] Strapi API request error: {
  name: 'NotFoundError',
  message: 'Not Found',
  details: {},
  status: 404
}
```

Requests using `filters` return HTTP 200 with empty arrays. Log flags do not treat those as errors, so handle empty results explicitly where needed.
