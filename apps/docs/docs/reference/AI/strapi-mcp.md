---
sidebar_position: 2
---

# Strapi MCP

Strapi ships a built-in [Model Context Protocol server](https://docs.strapi.io/cms/features/strapi-mcp-server) (Strapi 5.47+) that lets an MCP-capable agent read content types and read/write content over a single endpoint.

In this starter it is enabled by default in development and disabled by default elsewhere. `mcp.enabled` lives in `apps/strapi/config/server.ts`, can be toggled with `STRAPI_MCP_ENABLED`, and exposes `http://localhost:1337/mcp` authenticated with a Strapi API token.

## Connect an agent (Claude Code)

1. Make sure Strapi is running locally: `pnpm dev:strapi`.
2. Create an API token in **admin → Settings → API Tokens** — full access for local development, or scoped to limit which MCP tools are exposed. Treat it as a secret; never commit it.
3. Register the server with the Claude Code CLI:

   ```bash
   claude mcp add strapi-local --transport http http://localhost:1337/mcp \
     -H "Authorization: Bearer <token>"
   ```

4. Restart the session so the tools load, then approve the `mcp__strapi-local__*` tools (or pre-allow them in `.claude/settings.local.json`).

Other MCP clients (Cursor, Windsurf, Claude Desktop) use the same URL and Bearer header — see the official docs for client-specific config.

## Troubleshooting

- **`/mcp` returns 404** — MCP is disabled; check `mcp.enabled` / `STRAPI_MCP_ENABLED` and restart Strapi. Outside development, set `STRAPI_MCP_ENABLED=true` to opt in.
- **401 Unauthorized** — the API token is invalid, expired, or under-scoped.
- **Tools missing after config** — restart the agent session.
- **Connection refused** — Strapi isn't running on `:1337`.

## Seeding content over MCP

Once connected, the [seed-content](./skills/seed-content.md) skill can create pages, navbar, and footer content through the MCP tools.
