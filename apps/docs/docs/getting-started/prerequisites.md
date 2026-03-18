---
sidebar_position: 1
sidebar_label: "Prerequisites"
description: "Required tools and versions before cloning the monorepo."
---

# Prerequisites

| Tool           | Version       | Purpose                                  | Install                                                       |
| -------------- | ------------- | ---------------------------------------- | ------------------------------------------------------------- |
| Node.js        | 22+ (LTS)     | Runtime for all apps                     | [nodejs.org](https://nodejs.org/)                             |
| pnpm           | Latest (10.x) | Package manager, workspace orchestration | [pnpm.io/installation](https://pnpm.io/installation)          |
| Docker Desktop | Latest        | Local PostgreSQL for Strapi              | [docker.com](https://www.docker.com/products/docker-desktop/) |
| Git            | Latest        | Source control                           | [git-scm.com](https://git-scm.com/)                           |

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
