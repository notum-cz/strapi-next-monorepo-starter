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
- @strapi/plugin-users-permissions
- @strapi/provider-email-mailgun
- @strapi/provider-email-nodemailer
- @strapi/provider-upload-aws-s3
- strapi-plugin-config-sync
- qs
- lodash
- pg

## 🚀 Get up and develop

### 1. Environment variables

Copy & rename `.env.example` to `.env` and fill or update the values (most of the values are already set to default values, but you probably want to tweak them for your needs).

> [!TIP]
> React applications are notorious for embedding environmental variables into the build output of the application. If you want to avoid this, you can use our custom injectors for the UI and Strapi apps. This means you don't need to use the `STRAPI_ADMIN_` prefix.
>
> The values are injected into the admin HTML page using a script tag. You can access them using `window.STRAPI_ADMIN_CONFIG` object.
>
> This is disabled by default in Strapi. To configure this feature, you will need to set the `ADMIN_PANEL_CONFIG_API_AUTH_TOKEN` env variable for Strapi. You are free to generate your token value, for example using `openssl rand -base64 32` command. Once set, Strapi admin panel will start fetching the configuration during runtime.
>
> This happens during the bootstrap phase in the [app.tsx](./apps/strapi/src/admin/app.tsx) and it calls an [internal endpoint](./apps/strapi/src/api/admin-panel-config/services/admin-panel-config.ts) which requires configuration if you need additional ENV variables to be propagated. You can use this approach to add custom CSS, variables or JS code using the `window` API.

### 2. Run locally in dev mode (with hot-reloading)

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

### 3. Init database (first run)

There is `strapi-export.tar.gz` file in this directory with required initial data. **You should import** it to your local database with:

```bash
# in this directory

pnpm run import
```

Otherwise, you have to create following manually in Strapi admin panel:

- Create one page in `Page` collection with fullPath and slug = `/` (home page)
- Create navbar in `Navbar` single type
- Create footer in `Footer` single type

Because FE supports 2 languages (`en` and `cs`) by default, you have to enable both languages in Strapi (Settings > Internationalization). Then you need to create corresponding content for both languages.

### 4. Sync configuration

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

#### Link

The `utilities.link` component is used as the `StrapiLink` component within the frontend page builder.

It provides a unified abstraction for handling both internal and external links while maintaining consistency with the design system.

- Supports icons, sizes, and visual variants based on **shadcn/ui**
- Handles external links via a simple text (URL) field
- Handles internal links as relations to Strapi collection types, ensuring link stability when a page `fullPath` changes and preventing broken links

### Rich text editors

There are two integrated rich text editor options for Strapi content. Choose one based on your project needs — both have corresponding frontend renderers ready to use.

#### CKEditor (`@_sh/strapi-plugin-ckeditor`)

A classic HTML-based rich text editor. Content is stored as HTML and rendered on the frontend using `dangerouslySetInnerHTML` with built-in link processing and sanitization.

**Strapi component:** `utilities.ck-editor-content` or `utilities.ck-editor-text` (the difference is in the allowed toolbar options and styles, rendering is the same)

**Frontend usage:**

```tsx
import CkEditorRenderer from "@/components/elementary/ck-editor"

return (
  <CkEditorRenderer
    htmlContent={component.content}
    className="mx-auto w-full max-w-[1296px] px-4 py-8"
    variant="page" // "page" | "blog"
  />
)
```

Custom CKEditor plugins and heading styles are configured in `src/admin/ckeditor/`.

#### Tiptap editor (`@notum-cz/strapi-plugin-tiptap-editor`)

A JSON-based rich text editor. Content is stored as structured JSON (ProseMirror format) and rendered on the frontend using `tiptap-react-renderer` with full control over node/mark mapping.

> [!WARNING]
> We've just released the Tip tap editor plugin and it's still in early stages. The editor is stable and works well for basic use cases, but it may require some adjustments and improvements in the future. If you want to use it in production, please test it thoroughly with your content and report any issues you find in the [Github repository](https://github.com/notum-cz/strapi-plugin-tiptap-editor/issues). We are actively working on improving the plugin and adding new features, so your feedback is very valuable.

**Strapi component:** `utilities.tip-tap-rich-text`

**Frontend usage:**

```tsx
import { TiptapRichText } from "@/components/elementary/tiptap-editor"

return (
  <TiptapRichText
    content={component.content}
    defaultVariant="medium" // typography variant for text nodes
    defaultWeight="normal" // font weight for text nodes
    accentCursive="accent-cursive" // "accent-cursive" | "only-cursive" | "no-accent"
  />
)
```

### Plugins

All plugins are configured in [config/plugins.ts](config/plugins.ts) file. Some of them may require additional setting of API keys or different ENV variables. User-permissions, seo and config-sync plugins are enabled by default and don't require additional configuration.

#### `@strapi/provider-upload-aws-s3` (S3 file storage)

This plugin is used to store uploaded files (images, documents, etc.) in AWS S3 bucket instead of default local upload folder. This is required for production deployments where local file system is not persistent or files need to be served from CDN.

> [!TIP]
> In Heroku deployments you always should use S3 (or different external) storage instead of default local upload directory. Heroku resets dyno periodically (at least once a day or after every re-deploy) and so all uploaded files are removed.

Steps:

- go to [AWS console login](https://signin.aws.amazon.com/signin) and create bucket
- set ENV vars (at least `AWS_ACCESS_KEY_ID`, `AWS_ACCESS_SECRET`, `AWS_REGION`, `AWS_BUCKET`)
- in [config/middlewares.ts](config/middlewares.ts) whitelist URL of that S3 bucket in `directives` and `img-src` objects. Otherwise Strapi blocks these URLs and images are broken in UI. By default whole "amazonaws.com" is whitelisted, but you can be more specific here.

[More info here](https://market.strapi.io/providers/@strapi-provider-upload-aws-s3)

#### `@strapi/plugin-sentry` (Sentry logging)

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

#### Emails

To send emails from Strapi (e.g., registration confirmation, password reset, etc.), this starter preconfigures 2 email providers: Mailgun and Mailtrap. It is supposed that Mailtrap is used during development and Mailgun in production, but you can change this easily in [config/plugins.ts](config/plugins.ts) file - the selection is based on provided ENV variables.

##### `@strapi/provider-email-mailgun` (Mailgun)

It is supposed, that you created Mailgun account on [mailgun.com](https://www.mailgun.com/) and have your domain verified. Then set the following ENV variables in your `.env` file:

```bash
MAILGUN_API_KEY=your-mailgun-api-key
MAILGUN_DOMAIN=your-mailgun-domain
MAILGUN_EMAIL=default-from-and-replyto-address
MAILGUN_HOST=https://api.eu.mailgun.net
```

##### `@strapi/provider-email-nodemailer` (Mailtrap)

For development, the email plugin is configured to use [Mailtrap](https://mailtrap.io/) - a free email testing service that captures all outgoing emails without sending them to real recipients. This is perfect for testing registration emails, password resets, and other email functionality.

**Setup:**

1. Create a free account at [mailtrap.io](https://mailtrap.io/)
2. Go to your inbox settings and copy the SMTP credentials
3. Add the following to your `.env` file:

```bash
MAILTRAP_USER=your_mailtrap_username
MAILTRAP_PASS=your_mailtrap_password
MAILTRAP_HOST=sandbox.smtp.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_EMAIL=default-from-and-replyto-address
```

4. Restart Strapi - emails will now be captured in your Mailtrap inbox instead of being sent

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
   - **Redirect URL**: Your frontend callback URL (e.g., `https://your-domain.com/auth/strapi-oauth/callback`)
4. In your OAuth provider's settings (e.g., GitHub OAuth App):
   - **Homepage URL**: Your Strapi URL (e.g., `https://your-domain.com`)
   - **Authorization callback URL**: `https://your-domain.com/api/connect/github/callback`
5. The frontend automatically handles the OAuth flow - no additional configuration needed

**Local testing with ngrok:**

⚠️ **Important:** Most OAuth providers (including GitHub) don't accept `localhost` URLs. You must use ngrok or a similar tunneling service for local development.

1. Install ngrok: `brew install ngrok` (or download from [ngrok.com](https://ngrok.com))
2. Start your Strapi backend: `yarn dev:strapi`
3. In another terminal, tunnel to Strapi:
   ```bash
   ngrok http 1337
   ```
4. Copy the generated ngrok URL (e.g., `https://abc123.ngrok.io`)
5. Update `apps/strapi/config/server.ts`:
   ```ts
   url: "https://abc123.ngrok.io"
   ```
6. Update `apps/strapi/src/admin/vite.config.ts`:
   ```ts
   server: {
     allowedHosts: ["abc123.ngrok.io"]
   }
   ```
7. Set environment variables:

   ```bash
   # apps/strapi/.env
   APP_URL=https://abc123.ngrok.io
   ```

8. Update your OAuth provider (GitHub) with the ngrok URLs:
   - **Homepage URL**: `https://abc123.ngrok.io`
   - **Authorization callback URL**: `https://abc123.ngrok.io/api/connect/github/callback`
9. In Strapi admin (Settings > Users & Permissions > Providers > GitHub):
   - **Redirect URL**: Your frontend callback (e.g., `http://localhost:3000/auth/strapi-oauth/callback`)
10. Restart both backend and frontend

See the [Strapi GitHub provider documentation](https://docs.strapi.io/cms/configurations/users-and-permissions-providers/github) for more details.

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

### Health check endpoint

A simple health check endpoint is available at `/api/health`, e.g. [http://localhost:1337/api/health](http://localhost:1337/api/health). This can be used for monitoring and uptime checks.

### Strapi Live Previews

This starter supports Strapi's new feature: [Previews](https://docs.strapi.io/cms/features/preview). It works by embedding an iframe of the frontend application directly inside the editor.

In order to enable the feature, you need to configure the following environmental variables:

- `STRAPI_PREVIEW_ENABLED`: `true` to enable, otherwise disabled
- `CLIENT_URL`: Absolute URL of the frontend application (http://127.0.0.1:3000 for local development in most cases)
- `STRAPI_PREVIEW_SECRET`: shared secret between frontend and backend, which is used to authenticate if the preview can be viewed.
  If configured correctly, you should be able to visit previews for content types that have been implemented in the `preview.config` configuration object in `config/admin.ts`.
