---
sidebar_position: 8
---

# Docker Build

The Strapi Dockerfile builds a production runtime image for `apps/strapi`.

```txt
apps/strapi/Dockerfile
```

It follows the Strapi production Dockerfile approach and Turborepo's Docker pruning pattern for monorepos.

:::info Production runtime image
The Dockerfile is intended for production runs. Use the local development commands from [Installation](./installation.md) when working on Strapi locally.
:::

:::warning Build from monorepo root
Turborepo needs the root `package.json`, `pnpm-lock.yaml`, and `turbo.json` during the build. Run `docker build` from the monorepo root. See Turborepo's [Docker deployment docs](https://turbo.build/repo/docs/handbook/deploying-with-docker).
:::

## Build

```bash
docker build -t starter-strapi:latest -f apps/strapi/Dockerfile .
```

Set `APP_URL` as a build arg when the Strapi admin public URL should differ from the default local URL:

```bash
docker build -t starter-strapi:latest -f apps/strapi/Dockerfile \
  --build-arg APP_URL=https://cms.example.com \
  .
```

## Run

```bash
docker run -it --rm --name starter-strapi -p 1337:1337 \
  --env-file apps/strapi/.env starter-strapi:latest
```

To change the port, set `PORT` in `apps/strapi/.env` and update the Docker port mapping. The `-p` flag maps `host:container`.

## PostgreSQL

Strapi requires PostgreSQL before it starts. This starter does not provide a production `docker-compose.yml` that runs Strapi and PostgreSQL together. In production, the database is usually a separate managed service or a separate container.

Use a connection string or individual database variables in `apps/strapi/.env`:

```env
DATABASE_URL=postgres://user:password@host:port/database
```

or:

```env
DATABASE_HOST=
DATABASE_PORT=
DATABASE_NAME=
DATABASE_USERNAME=
DATABASE_PASSWORD=
```

## Local Container Network Example

When running both PostgreSQL and Strapi as local Docker containers, put them on the same Docker network.

Start the local database from `apps/strapi/docker-compose.yml`:

```bash
cd apps/strapi
docker compose up -d db
```

Set the database host to the Docker Compose service name (`.env`):

```env
DATABASE_HOST=db
```

Then run the Strapi container on the same network:

```bash
docker run -it --rm --name starter-strapi -p 1337:1337 \
  --env-file apps/strapi/.env \
  --network=strapi-next-starter_db_network \
  starter-strapi:latest
```

## Related Documentation

- [Strapi Docker installation docs](https://docs.strapi.io/cms/installation/docker)
- [Turborepo Docker deployment docs](https://turbo.build/repo/docs/handbook/deploying-with-docker)
