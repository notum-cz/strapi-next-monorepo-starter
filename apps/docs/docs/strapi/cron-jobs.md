# Cron Jobs

Strapi's built-in cron runner schedules background tasks inside the Strapi process. The template wires it up in [`apps/strapi/config/server.ts`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/strapi/config/server.ts) and defines tasks in [`apps/strapi/config/cron-tasks.ts`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/strapi/config/cron-tasks.ts).

Upstream reference: [docs.strapi.io/dev-docs/configurations/cron](https://docs.strapi.io/dev-docs/configurations/cron).

## Enabling

Off by default. Set `CRON_ENABLED=true` to start the scheduler.

```ts
// apps/strapi/config/server.ts
cron: {
  enabled: env.bool("CRON_ENABLED", false),
  tasks: cronTasks,
}
```

The production env override mirrors the same wiring in [`apps/strapi/config/env/production/server.ts`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/apps/strapi/config/env/production/server.ts) — flipping the env var is enough; no code change required to enable in prod.

## Task Shape

Each task is `{ task, options }`. `task` receives the Strapi instance; `options.rule` is a cron expression (six-field `node-schedule` syntax — seconds included).

```ts
// apps/strapi/config/cron-tasks.ts
const sayHelloJob = {
  task: ({ strapi }) => {
    strapi.log.info("A beautiful start to the week!")
  },
  options: {
    rule: "0 0 1 * * 1", // every Monday at 01:00
  },
}

export default {
  sayHelloJob,
}
```

Cron expression fields, in order: `second minute hour dayOfMonth month dayOfWeek`. Examples:

| Rule              | Meaning                       |
| ----------------- | ----------------------------- |
| `*/30 * * * * *`  | every 30 seconds              |
| `0 */5 * * * *`   | every 5 minutes               |
| `0 0 * * * *`     | top of every hour             |
| `0 0 2 * * *`     | every day at 02:00            |
| `0 0 1 * * 1`     | every Monday at 01:00         |
| `0 0 0 1 * *`     | first day of every month      |

A task can also pass an explicit `Date` (one-shot) or a `{ start, end, rule }` object to bound the active window — see the Strapi cron docs.

## Adding a New Task

1. Define the handler in `config/cron-tasks.ts` and export it on the default export.
2. Keep handlers thin — call into a service (`strapi.service("api::...")`) so the same logic is testable outside the scheduler.
3. Restart Strapi (or rely on `pnpm dev:strapi`'s watcher). The scheduler reads `tasks` at boot only.

```ts
const reindexProducts = {
  task: async ({ strapi }) => {
    await strapi.service("api::product.product").reindex()
  },
  options: { rule: "0 0 3 * * *" }, // 03:00 daily
}

export default {
  sayHelloJob,
  reindexProducts,
}
```

## Operational Notes

- **No backfill on restart.** If the process is down when a task should fire, that occurrence is lost. The scheduler does not catch up missed runs.
- **Errors are not retried.** A thrown handler is logged and the next scheduled tick proceeds normally. Wrap fallible work in `try/catch` and emit your own retry/queue semantics if needed.
- **Timezone.** `node-schedule` defaults to the server's local timezone. Set `TZ=UTC` in your container env if you want predictable scheduling across hosts. Or pass `options.tz` per task.
- **Long-running tasks block.** Tasks run in the Strapi process. Heavy work (large imports, image processing) should be kicked into a queue rather than executed inline.

## :warning: Multi-Instance Caveat

:::danger Strapi cron is per-process — every replica runs every task

The cron scheduler is started once per Node process. If you run Strapi with **N replicas** (horizontal scaling, Heroku dynos, Kubernetes `replicas > 1`, blue/green deploys, load balancer behind multiple containers), each replica independently fires every job at the scheduled time.

For "send weekly digest" or "nightly export" this means **N duplicate runs**. For "delete stale rows" or "charge subscriptions" it means data corruption.

There is **no built-in orchestration, leader election, or distributed lock**. You must add one.

:::

Pick one of the following patterns based on how you're running Strapi:

| Pattern                              | When to use                                                    | How                                                                                                                                                                                                                                            |
| ------------------------------------ | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Single dedicated scheduler replica** | Default fix. Cheap, simple, no extra infra.                    | Run one container/dyno with `CRON_ENABLED=true` and all others with `CRON_ENABLED=false`. Make sure your orchestrator (k8s/Heroku/etc.) does not scale that replica.                                                                          |
| **External scheduler hitting an HTTP endpoint** | You already have k8s `CronJob`, Heroku Scheduler, GitHub Actions, EventBridge, etc. | Disable Strapi cron entirely (`CRON_ENABLED=false`). Expose an internal HTTP route (auth-gated — Strapi API token or shared secret) that performs the work. Schedule the external job to `POST` it on the cadence you want. Single trigger, all replicas can serve it. |
| **Distributed lock**                 | You must keep tasks colocated with Strapi and can't pin a single instance. | Acquire a lock at task start (Postgres advisory lock, Redis `SET NX`, document with `documentId` = task name). Skip if held. Release at end. Set a TTL longer than worst-case task duration to recover from crashes.                          |

The single-replica pattern is the lowest-risk default for this template — flip `CRON_ENABLED` per replica via your deploy config and you're done. Reach for an external scheduler once you outgrow that (e.g. you need cross-region scheduling or auditability).


## Related Documentation

- [Strapi Plugins](./strapi-plugins.md) — operational plugins (Sentry, upload, email)
- [Strapi Schemas](../content-system/strapi-schemas.md) — document middlewares as an alternative for content-state side effects
- Upstream: [Strapi cron configuration](https://docs.strapi.io/dev-docs/configurations/cron)
