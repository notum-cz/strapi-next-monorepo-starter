---
sidebar_position: 1
---

# How to...

Short answers for common project setup and maintenance tasks.

<details>
<summary>How to set Strapi License?</summary>

Set `STRAPI_LICENSE` in the environment for the Strapi app.

For local development, add it to `apps/strapi/.env`:

```bash
STRAPI_LICENSE=
```

For deployed environments, configure the same variable in the hosting provider for `apps/strapi`.

</details>
