# 🔥 STRAPI - `@repo/strapi`

This is a [Strapi v5](https://strapi.io/) project.

## 🥞 Tech stack

- Strapi 5
- TypeScript
- Docker
- Postgres 16 alpine (in local docker container)

## 📦 Included plugins and packages

- @strapi/plugin-color-picker
- @strapi/plugin-i18n
- @strapi/plugin-sentry
- @strapi/plugin-seo
- @strapi/plugin-users-permissions
- @strapi/provider-email-mailgun
- @strapi/provider-upload-aws-s3
- strapi-plugin-config-sync
- qs
- lodash
- pg

## 🚀 Get up and develop

### Environment variables

Copy & rename `.env.example` to `.env` and fill or update the values (most of the values are already set to default values, but you probably want to tweak them for your needs).

> [!TIP]
> React applications are notorious for embedding environmental variables into the build output of the application. If you want to avoid this, you can use our custom injectors for the UI and Strapi apps. This means you don't need to use the `STRAPI_ADMIN_` prefix.
>
> The values are injected into the admin HTML page using a script tag. You can access them using `window.STRAPI_ADMIN_CONFIG` object.
>
> This is disabled by default in Strapi. To configure this feature, you will need to set the `ADMIN_PANEL_CONFIG_API_AUTH_TOKEN` env variable for Strapi. You are free to generate your token value, for example using `openssl rand -base64 32` command. Once set, Strapi admin panel will start fetching the configuration during runtime.
>
> This happens during the bootstrap phase in the [app.tsx](./apps/strapi/src/admin/app.tsx) and it calls an [internal endpoint](./apps/strapi/src/api/admin-panel-config/services/admin-panel-config.ts) which requires configuration if you need additional ENV variables to be propagated. You can use this approach to add custom CSS, variables or JS code using the `window` API.

### Run locally in dev mode (with hot-reloading)

Preferred way of running Strapi locally is to run **Postgres in docker** container and **Strapi locally**.

```bash
(nvm use) # switch node version
(pnpm i) # deps should be installed running `pnpm install` in the root

# start both services in 1 command [easiest way]
pnpm run dev
```

or

```bash
(nvm use) # switch node version
(pnpm i) # deps should be installed running `pnpm install` in the root

# start Postgres in docker container
docker compose up -d db

# start Strapi locally
pnpm run develop
```

Another way is to run **Strapi in docker** container too. Currently, an available Strapi [Dockerfile](Dockerfile) is prepared only for **production** run (see below).

#### Default dev addresses

- Strapi runs on [http://localhost:1337](http://localhost:1337)
- Admin panel is available on [http://localhost:1337/admin](http://localhost:1337/admin)
- Postgres runs on [http://localhost:5432](http://localhost:5432)

### Sync configuration

Go to Strapi admin panel and navigate to Settings > Config Sync > Tools. Click on "Import" button to import the configuration from files. More info about config sync is [below](#config-sync).

## 🛠️ Production Docker

To build and run Strapi in Docker container use [Dockerfile](Dockerfile) prepared for **production** environment. It follows Strapi official documentation and recommended way of running app in Turborepo monorepo structure.

> [!WARNING]
> Note, that Turborepo requires access to root `package.json`, `pnpm-lock.yaml` and `turbo.json` files so you have to build it within whole monorepo context - run `docker build` from monorepo root.
> [More info here](https://turbo.build/repo/docs/handbook/deploying-with-docker).

### Build

```bash
# from monorepo root

# build image, name and tag it
docker build -t starter-strapi:latest -f apps/strapi/Dockerfile .

# or build image and set APP_URL build arg to override localhost:1337 (default public URL of Admin panel)
docker build -t starter-strapi:latest -f apps/strapi/Dockerfile --build-arg APP_URL=https://cms.strapi-domain.dev .
```

### Run

```bash
# run container using image
docker run -it --rm --name starter-strapi -p 1337:1337 --env-file apps/strapi/.env starter-strapi:latest
```

To change port, set `PORT` env variable in `.env` file and in `docker run` command (`-p` flag means port mapping between host:container).

### Connect to Postgres in Docker

Strapi requires Postgres database to run before it starts. There is no production `docker-compose.yml` file prepared with both services connected. Usually they are run separately (database in one container or in cloud servise, Strapi in another container).

A) If you have Postgres connection string or credentials, set them in `.env` file before running Strapi container. Example:

```
# .env
DATABASE_URL=postgres://user:password@host:port/database

# or use separate variables like DATABASE_NAME, DATABASE_HOST, etc.
```

B) To connect 2 different containers (Strapi and Postgres) **both running in Docker**, you have to create a network and connect both containers to that network. Here is an example of how to do it locally:

```bash
# run Postgres in docker - you can use docker-compose.yml from this directory
docker compose up -d db

# set DATABASE_HOST or DATABASE_URL for Strapi in .env file - host should be set to "db" (name of the Postgres service in docker-compose.yml) or to IP of the host machine instead of "0.0.0.0"
DATABASE_HOST=db

# run Strapi in docker and connect to same network. In docker-compose.yml there is a "db_network" network already defined, so you don't have to create it. Just reference it in run command
docker run -it --rm --name starter-strapi -p 1337:1337 --env-file apps/strapi/.env --network=strapi-next-starter_db_network starter-strapi:latest
```

## ✨ Features

### Pages hierarchy

Documentation is in [/docs/pages-hierarchy.md](../../docs/pages-hierarchy.md)

### Plugins

Some preinstalled plugins (mailgun) are disabled by default. To turn them on go to [config/plugins.ts](config/plugins.ts) file and uncomment the lines. Some of them may require additional setting of API keys or different ENV variables.

User-permissions, seo and config-sync plugins are enabled by default. Sentry plugin requires setting up DSN key in ENV variables (see below).

#### AWS S3 caveats

In Heroku deployments you always should use S3 (or different external) storage instead of default local upload directory. Heroku resets dyno periodically (at least once a day or after every re-deploy) and so all uploaded files are removed.

Steps:

- go to [AWS console login](https://signin.aws.amazon.com/signin) and create bucket
- set ENV vars (at least `AWS_ACCESS_KEY_ID`, `AWS_ACCESS_SECRET`, `AWS_REGION`, `AWS_BUCKET`)
- in [config/middlewares.ts](config/middlewares.ts) whitelist URL of that S3 bucket in `directives` and `img-src` objects. Otherwise Strapi blocks these URLs and images are broken in UI. By default whole "amazonaws.com" is whitelisted, but you can be more specific here.

[More info here](https://market.strapi.io/providers/@strapi-provider-upload-aws-s3)

#### Sentry logging

Tu enable Sentry plugin, set `SENTRY_DSN` to environment variables. By default, Sentry runs only in production mode, but you can change it in [config/plugins.ts](config/plugins.ts) file.

Sentry service can be used in Strapi controllers and services as any other service. Uncaught errors are logged automatically. More information can be found in [Sentry](https://docs.sentry.io/platforms/javascript/) and [Strapi](https://docs.strapi.io/dev-docs/plugins/sentry) docs.

```ts
// example of how to use Sentry in controller

async find(ctx) {
    // this will log error to Sentry automatically
    throw new Error("Not implemented")

    // get sentry service
    const sentry = strapi.plugin("sentry").service("sentry")

    // manual error logging
    sentry.sendError(new Error("My custom error"))

    // get direct access to the Sentry instance
    const instance = sentry.getInstance()
    // call captureMessage or other Sentry functions
    // pay attention, instance is undefined if Sentry is disabled (during development)
    instance?.captureMessage("My custom message")

    return []
},
```

#### Mailtrap (Email testing)

For development, the email plugin is configured to use [Mailtrap](https://mailtrap.io/) - a free email testing service that captures all outgoing emails without sending them to real recipients. This is perfect for testing registration emails, password resets, and other email functionality.

**How it works:**

- In development (`NODE_ENV !== "production"`), Strapi uses Mailtrap if credentials are provided
- In production, it automatically switches to Mailgun
- Configuration is handled automatically in [config/plugins.ts](config/plugins.ts)

**Setup:**

1. Create a free account at [mailtrap.io](https://mailtrap.io/)
2. Go to your inbox settings and copy the SMTP credentials
3. Add the following to your `.env` file:

```bash
MAILTRAP_USER=your_mailtrap_username
MAILTRAP_PASS=your_mailtrap_password
MAILTRAP_HOST=sandbox.smtp.mailtrap.io
MAILTRAP_PORT=2525
```

4. Restart Strapi - emails will now be captured in your Mailtrap inbox instead of being sent

**Note:** If Mailtrap credentials are not provided, Strapi will fall back to Mailgun (if configured) or use a dummy configuration.

#### OAuth providers (GitHub, Google, etc.)

The starter supports OAuth authentication through Strapi's Users & Permissions plugin. Users can sign in with providers like GitHub, Google, Facebook, etc.

**How it works:**

1. User clicks "Sign in with GitHub" (or other provider) on the frontend
2. Frontend redirects to Strapi's OAuth endpoint: `/api/connect/{provider}`
3. Strapi handles OAuth flow and redirects back to frontend with access token
4. Frontend syncs the OAuth session with Strapi via `/auth/strapi-oauth/callback`
5. User is authenticated and session is created

**Setup:**

1. Go to Strapi admin panel: Settings > Users & Permissions > Providers
2. Enable your desired provider (e.g., GitHub)
3. Configure the provider:
   - **Client ID** and **Client Secret**: Get these from your OAuth provider (e.g., GitHub Developer Settings)
   - **Redirect URL**: Add `http://localhost:1337/api/connect/{provider}/callback` (replace `{provider}` with actual provider name)
4. In your OAuth provider's settings (e.g., GitHub), add the redirect URL: `http://localhost:1337/api/connect/github/callback`
5. The frontend automatically handles the OAuth flow - no additional configuration needed

**Supported providers:**

Any provider supported by Strapi's Users & Permissions plugin (GitHub, Google, Facebook, Discord, etc.). The frontend code in [apps/ui/src/app/[locale]/auth/signin/\_components/SignInForm.tsx](../../apps/ui/src/app/[locale]/auth/signin/_components/SignInForm.tsx) shows how to add additional provider buttons.

#### Config-sync

[strapi-plugin-config-sync](https://www.npmjs.com/package/strapi-plugin-config-sync) plugin is installed by default to sync configuration between environments.

#### Relation population

Strapi offers fine-grained control over population of data coming from the API. Our Strapi Client is fully typed and offers suggestions, but there are instances where you may want to avoid this. For example, the dynamic zone in `api::page.page` collection includes many components. Serializing the full population object for this DZ would yield an URL that's too long and may cause issues.

To overcome this issue, this project uses a document middleware. This allows you to control which relations are deeply populated on a per-request basis, optimizing data fetching for complex page structures.

**How it works:**

- The middleware is registered in `apps/strapi/src/index.ts`.
- The middleware interceptor is implemented in `apps/strapi/src/documentMiddlewares/page.ts`.
- It intercepts document queries for the `api::page.page` content type, specifically for the `findMany` action.
- To trigger custom population, your request must include the following in the query parameters:
  - Pagination: `{ page: 1, pageSize: 1 }`, which gets updated to `{start: 0, limit: 1}` during the request resolution (before reaching document middleware)
  - `middlewarePopulate`: an array of string keys, each corresponding to a relation or field you want to populate (as defined in the middleware's `pagePopulateObject`).

**Example request:**

```js
await PublicStrapiClient.fetchOneByFullPath("api::page.page", fullPath, {
  locale,
  populate: {
    content: true, // ensures typing is valid on the resulting object
    seo: true, // ensures typing is valid on the resulting object
  },
  middlewarePopulate: ["content", "seo"], // ensures the middleware is triggered and the populate object is replaced
})
```

- The middleware will map each key in `middlewarePopulate` to the corresponding population rules in `pagePopulateObject`, and apply them to the query.
- This enables fine-grained, dynamic control over which relations and nested fields are included in the response.

**Other collections**
Feel free to create your own middlewares for collections where you may need deep-population without specifying it in the request itself. This may be useful for large collections.

**Pitfalls**
This requires active maintenance, as any changes to collections (i.e. the DZ in Page collection) will need to be reflected in the populate middleware. There is an alternative of using a deep-populate middleware, however this is STRONGLY discouraged. That's also why we removed it, despite using it in this project initially.

'middlewarePopulate' does not alter the types, so using it by itself will result in a type that does not include relations or dynamic zones. This is why we also include it in the populate object.

### Typescript

[Typescript is used in this template](https://docs.strapi.io/dev-docs/typescript). Typings schemas are generated automatically after code change by Strapi (based on configuration in [config/typescript.ts](config/typescript.ts) and stored in [types/generated/\*](types/generated) as ts definition files. Do not modify them manually, let Strapi do it. Don't forget to version them in git.

> [!WARNING]
> By enabling and generating types in Strapi, the API and models on the frontend are typed out-of-box through [@repo/strapi-types](../../packages/strapi-types/README.md) workspace package. By turning it off, the code related to the API on the frontend will have to be modified.

### Lifecycle hooks

#### Registration emails

In [src/index.ts](src/index.ts) there are prepared hooks for sending email to admin and user after registration (`afterCreate` hook). By default they are **disabled** (commented out). Before enabling them, you have to turn on email plugin in `config/plugins.ts` and provide required ENV variables (**without email service emails won't work and Strapi will die with every user registration**).

### Transfer data between environments

Data can be easily transferred between environments in multiple ways. Check out official docs [https://docs.strapi.io/dev-docs/data-management](https://docs.strapi.io/dev-docs/data-management). Scripts are prepared in `package.json` see `export:all`, `export:content`, `import`, `transfer`.

### Cron jobs

Edit `config/cron-tasks.ts` to add cron jobs. Enable them by setting `CRON_ENABLED=true` in `.env` file.

### Strapi Live Previews

This starter supports Strapi's new feature: [Previews](https://docs.strapi.io/cms/features/preview). It works by embedding an iframe of the frontend application directly inside the editor.

In order to enable the feature, you need to configure the following environmental variables:

- `STRAPI_PREVIEW_ENABLED`: `true` to enable, otherwise disabled
- `CLIENT_URL`: Absolute URL of the frontend application (http://127.0.0.1:3000 for local development in most cases)
- `STRAPI_PREVIEW_SECRET`: shared secret between frontend and backend, which is used to authenticate if the preview can be viewed.
  If configured correctly, you should be able to visit previews for content types that have been implemented in the `preview.config` configuration object in `config/admin.ts`.
