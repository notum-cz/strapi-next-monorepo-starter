---
sidebar_position: 1
---

# Installation

Set up the monorepo on a fresh machine.

## Prerequisites

| Tool                                 | Version  | Why                                                   |
| ------------------------------------ | -------- | ----------------------------------------------------- |
| Node.js                              | `24.x`   | Workspace constraint (`engines.node: ^24.0.0`)        |
| pnpm                                 | `11.1.1` | Workspace manager — pinned via `packageManager` field |
| Docker                               | latest   | Local Postgres for Strapi (+ optional imgproxy)       |
| Git                                  | any      | clone + hooks                                         |
| [nvm](https://github.com/nvm-sh/nvm) | optional | switch Node versions                                  |

Optional but recommended: install VSCode extensions from [`.vscode/extensions.json`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/.vscode/extensions.json).

## Clone

```bash
git clone https://github.com/notum-cz/strapi-next-monorepo-starter
cd strapi-next-monorepo-starter
git checkout main
```

Or click **[Use this template](https://github.com/notum-cz/strapi-next-monorepo-starter/generate)** on GitHub to create your own copy.

## Install dependencies

```bash
nvm use                                          # Node 24
corepack prepare pnpm@11.1.1 --activate          # ensure correct pnpm
pnpm install
```

`pnpm install` triggers `postinstall` which:

- runs `setup:apps` — copies every `*.example` file to its non-`.example` sibling (creates `.env`, `.env.local` from templates)
- runs `prepare` — installs Lefthook git hooks

## Environment files

After install, you'll have:

- `apps/strapi/.env` — Strapi backend
- `apps/ui/.env.local` — Next.js frontend

Both start from `.env.example` templates. Most values work out of the box; you'll need to fill at minimum a Strapi API token before the UI can fetch content — covered in [Quick Start](./quick-start.md).

Full env reference: [Architecture → Environment Variables](../architecture.md#environment-variables).

## Verify

```bash
pnpm typecheck     # all packages compile
pnpm lint          # ESLint passes
```

If both succeed the workspace is wired correctly. Next: [Quick Start](./quick-start.md).
