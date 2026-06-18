---
sidebar_position: 3
---

# Config Sync

[`strapi-plugin-config-sync`](https://www.npmjs.com/package/strapi-plugin-config-sync) stores selected Strapi configuration in version-controlled JSON files.

It is used for settings such as roles, permissions, and plugin configuration that otherwise live only in the database.

## Sync After Install

1. Open Strapi admin.
2. Go to Settings → Config Sync → Tools.
3. Click **Import**.

Commit generated `config/sync/` files when configuration changes should travel with the project.
