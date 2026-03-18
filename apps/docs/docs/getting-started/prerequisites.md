---
sidebar_position: 1
sidebar_label: "Prerequisites"
description: "Required tools and versions before cloning the monorepo."
---

# Prerequisites

| Tool           | Version                     | Purpose                                  |
| -------------- | --------------------------- | ---------------------------------------- |
| Node.js        | >=20, 22+ (LTS) Recommended | Runtime for all apps                     |
| pnpm           | Latest (10.x)               | Package manager, workspace orchestration |
| Docker Desktop | Latest                      | Local PostgreSQL for Strapi              |

:::tip
The repo includes `.nvmrc` pinned to Node 22. If you use nvm:

```bash
nvm install
nvm use
```

:::

:::note
pnpm is the **only** supported package manager. The monorepo uses Turborepo + pnpm workspaces -- npm and yarn will not resolve dependencies correctly. The `preinstall` script enforces this via `only-allow pnpm`.
:::
