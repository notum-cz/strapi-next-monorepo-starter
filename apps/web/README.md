# 🔥 UI Starter Template

This is a [Next.js v15](https://nextjs.org/docs) project.

## 🥞 Tech stack

- node 22
- yarn 1.22
- Next.js 15 App router
- React 18
- TypeScript
- [shadcn/ui](https://ui.shadcn.com/)
- [TailwindCSS 4](https://tailwindcss.com/)
- [Lucide icons](https://lucide.dev)

## 📦 Included packages

- next-auth
- next-intl
- next-themes (for dark mode)
- next-recaptcha-v3
- react-hook-form
- zod
- @tanstack/react-query
- @tanstack/react-table
- react-use
- react-device-detect
- @sentry/nextjs
- dayjs
- lodash
- plaiceholder
- tailwindcss, cva, tailwindcss-animate

## 🚀 Get up and develop

### Environment variables

Copy & rename `.env.local.example` to `.env.local` and fill or update in the values. `APP_PUBLIC_URL`, `STRAPI_URL` and `STRAPI_REST_READONLY_API_KEY` are required.

#### Read-only API token

To fetch public content from Strapi, you need to set `STRAPI_REST_READONLY_API_KEY` env variable. Based on [Strapi docs](https://docs.strapi.io/cms/features/api-tokens) you have to go to [Settings > API Tokens](http://localhost:1337/admin/settings/api-tokens) and "Create new API token". Token configuration:

```
Name: any name
Description: optional
Token duration: Unlimited
Token type: Read-only
```

Token will only be displayed once.

#### Custom API token

For other requests methods (POST, PUT, DELETE), we use custom API token, that has **manually** allowed permissions for specific operations and content types. Create it when you need to modify data in Strapi from the UI app. This token is also set as an environmental variable `STRAPI_REST_CUSTOM_API_KEY` and has following configuration:

```
Name: any name
Description: optional
Token duration: Unlimited
Token type: Custom
Permissions: "Create subscriber"
```

### Run locally in dev mode (with hot-reloading)

To run the app locally use:

```bash
(nvm use) # switch node version
(yarn) # deps are probably already installed running `yarn` in root

yarn dev
```

App runs on [http://localhost:3000](http://localhost:3000) by default.

## 🛠️ Production build (Docker)

To build and run Next.js in Docker container use [Dockerfile](Dockerfile) prepared for **production** environment. It follows recommended way of running app in Turborepo monorepo structure. Note, that Turborepo requires access to root `package.json`, `yarn.lock` and `turbo.json` files so you have to build it within whole monorepo context - run `docker build` from monorepo root. [More info here](https://turbo.build/repo/docs/handbook/deploying-with-docker).

```bash
# from monorepo root

# build image and name it
docker build -t ui:latest -f apps/ui/Dockerfile .

# run container using image
docker run -it --rm --name ui -p 3000:3000 --env-file apps/ui/.env ui:latest
```

To change port, set `PORT` env variable in `.env` file and in `docker run` command (`-p` flag means port mapping between host:container).

Dockerfile assumes that Next.js app is ["outputed"](https://nextjs.org/docs/14/app/api-reference/next-config-js/output) in `standalone` mode (see [next.config.mjs's output option](next.config.mjs) for details), which is useful for self-hosting in a Docker container (includes only necessary files and dependencies). It is controlled using `NEXT_OUTPUT` env variable. Any other value than `standalone` will require changes in Dockerfile (eg. `runner` stage).

### Output modes

Next.js has three `output` modes:

- `export` – Static HTML/CSS/JS files [are generated at build time](https://nextjs.org/docs/14/app/building-your-application/deploying/static-exports) and can be served by any static hosting or CDN. No Node.js server is required. [Dynamic features are not supported](https://nextjs.org/docs/14/app/building-your-application/deploying/static-exports#unsupported-features). This mode is **not supported** in this starter repo due to its dynamic features (e.g. NextAuth and the [POST endpoint](src/app/api/auth/[...nextauth]/route.ts)).
- `standalone` – Optimized output for self-hosting in a Docker container. It includes only the necessary files and dependencies (see above for more info).
- `undefined` – Default build output in the `.next` directory. This mode is used with `next start` in production or by hosting providers like Vercel. It requires a Node.js server.

### Data revalidation (ISR)

This approach allows static content to be updated without rebuilding the entire site. Data revalidation does not work in plain static `export` output mode, as the app is fully static and lacks a server to handle revalidation. Incremental Static Regeneration (ISR) improves performance and reduces server load.

In this starter, ISR with time-based revalidation is used by default. Revalidation is applied globally to all fetch requests, but it can also be controlled individually via parameters in the fetch functions (see [BaseStrapiClient](src/lib/strapi-api/base.ts)). The revalidation interval is configurable using the `NEXT_PUBLIC_REVALIDATE` environment variable, and is set to `0` (no caching) during development.

[More information about ISR](https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration)

## ⛺ Included code

There is a lot of code prepared in this template:

- `src/app/[locale]` - page-builder pages fetched from Strapi and frontend pages for authorization
- `src/components` - folder with components

For more details see [project structure](#project-structure) section below.

Not all predefined components or routes are needed in the final app, so unnecessary parts should be removed. A function called `removeThisWhenYouNeedMe` is placed at the top of each route or component and logs a warning message to the console. It helps identify unused or placeholder code. If the function, component, or page is required, simply remove the call to `removeThisWhenYouNeedMe`. Any code that still includes this call should be removed as development progresses.

## 🧬 Project structure

- `/src/app` – Next.js App Router main application. Components related to a specific page (i.e. used only on that page or its nested routes) should be placed in `/src/pageName/_components`. For example, do not place the `SignInForm` component in a shared folder like `/src/components/forms` if it is only used on one page.
- `/src/components` – Shared components used across multiple pages or globally (e.g. providers). Organize them into subfolders based on purpose:
  - `/src/components/elementary` – Basic or standalone components that can be reused anywhere
  - `/src/components/forms` – Components related to forms, such as wrappers and field types
  - `/src/components/page-builder` – Components for the Strapi page builder, [more info here](#page-builder)
  - `/src/components/providers` – Global wrapper components (e.g. context providers)
  - `/src/components/typography` – Components like Heading, Paragraph, etc.
  - `/src/components/ui` – Tailwind wrappers around Radix UI components from the `shadcn/ui` library. This directory is **controlled** by shadcn. You can edit individual files (e.g. to adjust design or fix issues), but do not rename the folder or component files. [More info here](#shadcn)
- `/src/hooks` – Custom React hooks
- `/src/lib` – Shared utilities, helpers, and functions for auth, theme, i18n, dates, navigation, reCAPTCHA, styles, etc.
  - `/src/lib/metadata` – Helpers for building page metadata from Strapi content
  - `/src/lib/strapi-api` – Public and private API clients for fetching data from Strapi (see [Data fetching](#data-fetching))
- `/src/locales` – Localization files
- `/src/styles` – Global styles
- `/src/types` – Type definitions (global types, API types, helper types, etc.)

### shadcn

Shadcn/ui is a lightweight UI library that combines Radix UI components with Tailwind CSS for styling. A list of available components can be found in the [docs](https://ui.shadcn.com/docs/components). Many components are pre-installed in this project by default. If you need additional components, you can either manually copy them from the docs or, preferably, use the CLI.

For example, to add an [accordion component](https://ui.shadcn.com/docs/components/accordion), run `npx shadcn-ui@latest add accordion` in this directory. The component will be added to the `/src/components/ui` folder, as defined in the [Shadcn config file](https://ui.shadcn.com/docs/components-json) located at [components.json](components.json). Once added, the component can be imported normally or its source code modified as needed.

#### Themes

It is possible to build your own theme at [https://ui.shadcn.com/themes](https://ui.shadcn.com/themes), where you can configure global component styles, colors, border radius, export the theme, and integrate it into your project. More details are available in the [docs](https://ui.shadcn.com/docs/theming).

- `/src/styles/globals.css` – Contains the project theme, Tailwind CSS configuration, and imports shared styles from the [@repo/design-system](../../packages/design-system/README.md) package.

To merge multiple Tailwind classes and handle dynamic class names more effectively, **strictly use** the `cn` function defined in `/src/lib/styles.ts`.

```tsx
import { cn } from "@/lib/styles"

export function MyComponent() {
  return (
    <div className={cn("flex items-center justify-center", className)}>...</div>
  )
}
```

## ✨ Features

### Data fetching

There are 2 ways to fetch data from Strapi. Both of them use [BaseStrapiClient](src/lib/strapi-api/base.ts) class as a base class. This class isn't used directly, but extended by other classes.

#### Public API

To fetch data from the public Strapi API, it is assumed that you have generated the necessary [API tokens](#environment-variables). The [PublicStrapiClient](src/lib/strapi-api/public.ts) class is used for making public API requests — no user JWT token is included in these requests.

To fetch data from **server context** (SSR components, server actions, etc.) use this client instance without setting `useProxy` option in `CustomFetchOptions` parameter. This is **default** behavior. In this case the client calls Strapi directly.

To fetch data from **client context** (client components, client hooks, etc.), you must set `useProxy: true` in the `CustomFetchOptions`. In this case the client uses [route handler](src/app/api/public-proxy/[...slug]/route.ts) as a public proxy. See [PagesCatalogue](./src/components/elementary/PagesCatalog.tsx) component for an example of how to use it. This proxy serves two main purposes:

- To hide the authenticated API token from the client request.
- To obscure the Strapi backend URL, preventing users from accessing it directly.

The API client (called directly or through proxy) automatically injects either the `STRAPI_REST_READONLY_API_KEY` or `STRAPI_REST_CUSTOM_API_KEY` into the `Authorization` header. These keys are stored securely on the server. The choice of token depends on the HTTP method: `GET` requests use the read-only token, while other methods use the custom token.

With the read-only token, it's possible to fetch data from any Strapi content type (assuming the endpoint name can be guessed). To improve security and prevent unrestricted data access, an additional layer — `ALLOWED_STRAPI_ENDPOINTS` — is used. This list defines the specific Strapi endpoints that are allowed to be accessed. Keep it **up to date** with the content types you want to expose.

#### Private API

Applications with authentication pages (e.g. `/auth/signin`, `/auth/register`) require the [Strapi Users & Permissions plugin](https://docs.strapi.io/cms/features/users-permissions) to be enabled. This is enabled by default. The [PrivateStrapiClient](src/lib/strapi-api/private.ts) class is used for making private API requests — user JWT tokens are automatically injected on both the server and client sides, and it returns data related to the logged-in user.

It works similarly to the public API client - for requests coming from the **server context**, you should use the client instance without setting `useProxy` option in `CustomFetchOptions` (by default). In this case the Strapi is called directly. For requests coming from the **client context**, you must set `useProxy: true` in the `CustomFetchOptions`. In this case the client uses [route handler](src/app/api/private-proxy/[...slug]/route.ts) as a private proxy. This proxy hides the Strapi backend URL, preventing users from accessing it directly.

The frontend app uses the `next-auth` package, which is configured in [src/lib/auth.ts](src/lib/auth.ts) and [src/app/api/auth/[...nextauth]/route.ts](src/app/api/auth/[...nextauth]/route.ts) to manage user sessions.

In the [middleware.ts](src/middleware.ts) file, the `authMiddleware` is used to check whether the user is authenticated. A list called `authPages` contains the routes that require authentication. If a user is not authenticated and tries to access a private route, they are redirected to the login page.

To retrieve the session (logged-in user) in server components, use the `getAuth()` helper.

```tsx
import { getAuth } from "@/lib/auth"

export default async function ProfilePage() {
  const session = await getAuth()
  const user = session?.user.data

  return <div></div>
}
```

To get session in client components use `useSession()` from `next-auth/react`:

```tsx
"use client"

import { useSession } from "next-auth/react"

export default function ProfilePage() {
  const session = useSession()
  const user = session.data?.user

  return <div></div>
}
```

To omit the `Authorization` header and skip token detection, you can pass `omitUserAuthorization: true` in the `options` object of the `fetchAPI` function. Token detection is a dynamic operation, which prevents static rendering of the page.

#### Fetch functions

The [BaseStrapiClient](src/lib/strapi-api/base.ts) class contains functions that wrap the native `fetch()` method, with pre-configured base path, token management, headers, and query parameter handling. It provides the following functions: `fetchAPI`, `fetchOne`, `fetchMany`, `fetchAll`, `fetchOneBySlug`, and `fetchOneByFullPath`.

- `fetchAPI` – the most general-purpose function for making API requests (`GET`, `POST`, `PUT`, `DELETE`). It can be used in any scenario, but the return type must be manually specified. This function is especially useful when:

  - Fetching data from or sending data to a custom Strapi endpoint (e.g. `GET /users/my-logic-endpoint`)
  - The data is not associated with any Strapi content type
  - The endpoint is already used by another handler (e.g. the content type `"plugin::users-permissions.user"` is reserved for `GET /users`, so `GET /users/me` must use `fetchAPI` instead — see below):

```ts
import { Result } from "@repo/strapi"

const fetchedUser: Result<"plugin::users-permissions.user"> =
  await Strapi.PrivateStrapiClient("/users/me", undefined, undefined, {
    userJWT: token.strapiJWT,
  })
```

- other fetch functions – these are directly tied to Strapi content types. When calling them, you must specify the UUID (e.g. `"api::"`, `"admin::"`) of the `ContentType` you want to fetch. Based on this UUID, the response type is automatically inferred.
  **To make this work**, you need to maintain a mapping between the `ContentType` UUID and the corresponding endpoint URL path—refer to the `API_ENDPOINTS` object in the [BaseStrapiClient](src/lib/strapi-api/base.ts) file. Also, Strapi **must have** [types generation](https://docs.strapi.io/cms/configurations/typescript#strapi-specific-configuration-for-typescript) enabled (true by default).

> [!WARNING]
> All attributes (and relations) are currently typed as optional (`... | null | undefined`) even if they are required in Strapi. This is current limitation of automatic typing inference and needs to be improved in future versions of this starter.

In client React components/hooks use `useQuery` (or `useMutation`) hook from `@tanstack/react-query` to query/mutate data in reactive way (see example in [usePages](./src/hooks/usePages.ts)). In server components call endpoint directly and fetch data (`/GET` endpoints) on server side. Fetch functions are stored in [strapi-api/content/server file](./src/lib/strapi-api/content/server.ts). You can also use Next.js' [server actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations).

```tsx
// src/lib/strapi-api/content/server.ts
export async function fetchNavbar(locale: AppLocale) {
  try {
    return await PublicStrapiClient.fetchOne("api::navbar.navbar", undefined, {
      locale,
      populate: {
        links: true,
        logoImage: { populate: { image: true, link: true } },
      },
    })
  } catch (e: any) {
    ...
  }
}

// src/components/page-builder/single-types/navbar/StrapiNavbar.tsx
import { fetchNavbar } from "@/lib/strapi-api/content/server"

export async function StrapiNavbar({ locale }: { readonly locale: AppLocale }) {
  const response = await fetchNavbar(locale)
}
```

### Page builder

Page builder landing page is rendered inside the main [dynamic route](src/app/[locale]/[[...rest]]/page.tsx). It is an optional catch-all segment that captures every segment — in our case, the `fullPath` attribute of pages (e.g. `/page-1-full-path`) from Strapi. All published pages are rendered as nested URLs.

Special case is the Index/Root page. By default, its `fullPath` is set to shared value `/` in the [@repo/shared-data](../../packages/shared-data/index.ts) package.

Another important aspect is the mapping between Strapi components and frontend components. This is handled in the [src/components/page-builder/index.ts](src/components/page-builder/index.tsx) file. `PageContentComponents` contains a mapping between Strapi component names and their corresponding React components.

> [!WARNING]
> The mapping is not automatically generated, and it is your responsibility to keep it up to date. If you add a new page-level component in Strapi, you need to add it here as well.
> Currently, there is a performance issue with dynamic lazy-loading and all components are preloaded in the page builder. This is a known issue and will be fixed in the future. See [#65](https://github.com/notum-cz/strapi-next-monorepo-starter/issues/65)

> [!TIP]
> Not all Strapi components should be rendered at the page level. Some components are intended to be used as subcomponents within other components (e.g. elements, utilities).
> Single types (e.g. Navbar, Footer) are not rendered in the page builder, but are fetched and rendered separately. They are not included in the `PageContentComponents` mapping.

### Metadata, sitemap.xml and robots.txt

To generate **metadata** for each Page Builder page, the `generateMetadata()` function is used. It is called in the main [page builder page](./src/app/[locale]/[[...rest]]/page.tsx) and generates metadata based on the Strapi page's `seo` attribute. It creates standard page metadata, as well as Open Graph and Twitter tags, with fallbacks from locale files. See [getMetadataFromStrapi function](./src/lib/metadata/index.ts) for more details. To add structured data (LD-JSON), use the [StrapiStructuredData](./src/components/page-builder/components/seo-utilities/StrapiStructuredData.tsx) component, which is included by default.

To generate **sitemap.xml**, we use the [built-in](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap) Next.js [sitemap.ts file](./src/app/sitemap.ts). It generates a sitemap based on Strapi data. You can specify which collections are pageable and should appear in the XML (defaults to `"api::page.page"`). The sitemap is created at runtime and revalidated according to the `NEXT_PUBLIC_REVALIDATE` environment variable. This behavior can be easily customized in the `fetchAll` function. The sitemap is not generated in environments other than production (env.APP_ENV === "production"). The sitemap is available at [localhost:3000/sitemap.xml](http://localhost:3000/sitemap.xml).

To generate **robots.txt**, we also use the [built-in](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots) Next.js [robots.ts file](./src/app/robots.ts). It generates a robots.txt file with a basic configuration. Like `sitemap.xml`, this file is created only in the `production` environment. The robots.txt file is available at [localhost:3000/robots.txt](http://localhost:3000/robots.txt).

### Strapi Live Previews

This starter supports Strapi's new feature [Previews](https://docs.strapi.io/cms/features/preview). It works by embedding an iframe of the frontend application directly inside the editor. In order to enable the feature, you need to configure the following `STRAPI_PREVIEW_SECRET` env variable. It must be same for frontend and backend.

We use Next.js's built-in [draft mode](https://nextjs.org/docs/app/guides/draft-mode) to enable draft mode in the app. Configuration is done in the [route handler](src/app/api/preview/route.ts) and the [StrapiPreviewListener component](src/components/elementary/StrapiPreviewListener/index.tsx).

### Localization

App is ready for localization. It uses `next-intl` package with basic configuration. For more in-depth configuration, see the [docs](https://next-intl-docs.vercel.app/docs/getting-started/app-router). Relevant files:

- Next-intl plugin is defined in [src/lib/i18n.ts](src/lib/i18n.ts) and used by [src/middleware.ts](src/middleware.ts) and registered in [next.config.mjs](next.config.mjs)
- locales (messages) in [src/locales](locales/) directory
- augmented types configured in `src/types/global.d.ts`, so messages keys in `useTranslation()` or `getTranslations()` are auto-completeable during development
- Navigation utils are wrapped using `createSharedPathnamesNavigation()` in [src/lib/navigation.ts](src/lib/navigation.ts) to provide `usePathname`, `Link`, `redirect` and `useRouter` with correct locale prefix

Usage:

```tsx
// Client or Server component without "async" - `useTranslations()`

import { useTranslations } from "next-intl"

export default function Page() {
  const t = useTranslations("general")
  return <div>{t("loading")}...</div> // "Loading..."
}
```

```tsx
// Server component with "async" - `getTranslations()`

import { getTranslations } from "next-intl/server"

export default async function ProfilePage() {
  const user = await fetchUser()
  const t = await getTranslations("ProfilePage")

  return (
    <PageLayout title={t("title", { username: user.name })}>
      <UserDetails user={user} />
    </PageLayout>
  )
}
```

### Navigation

For full navigation functionality in cooperation with `next-intl`, some functions/components from `next/navigation` must be wrapped (see above). This applies to: `Link, redirect, usePathname, useRouter`. You **have to** use them instead of the original ones.

```tsx
// ✅ OK
import { notFound, useSearchParams } from "next/navigation"
import { Link, useRouter, redirect } from "@/lib/navigation"

// ❌ NOT OK
import { Link, useRouter, redirect } from "next/navigation"
```

### Environment variables

Define them in [.env.local.example](./.env.local.example), [.env.local](./.env.local) and [src/env.mjs](./src/env.mjs) file where [@t3-oss/env-nextjs](https://github.com/t3-oss/t3-env) validation package is used. This package is used to validate and type-check environment variables. Usage:

```tsx
import { env } from "@/env.mjs"

// ✅ OK
console.log(env.STRAPI_URL)

// ❌ NOT OK
console.log(process.env.STRAPI_URL)
```

Environment variables that need to be available in the build-time context of Turborepo tasks must be defined in the [turbo.json](../../turbo.json) file under the `globalEnv` section. The build step (`turbo run build`) runs in a sandboxed environment where only explicitly specified environment variables are accessible. Mandatory variables (e.g. `STRAPI_URL`, `APP_PUBLIC_URL` or `STRAPI_REST_READONLY_API_KEY`), as defined in `env.mjs`, must be included in `globalEnv`. **This is essential** for the build process to function correctly with Turborepo and t3 package.

Environment variables starting with `NEXT_PUBLIC_` are [automatically available](https://nextjs.org/docs/app/guides/environment-variables#runtime-environment-variables) in the client-side code. Don't store any sensitive information in these variables, as they are exposed.

### Error handling

General unexpected **rendering** and **lifecycle** errors (not event handlers, not async code) are automatically caught by boundary defined in root [error.tsx](src/app/[locale]/error.tsx). This file [can be defined](https://nextjs.org/docs/app/building-your-application/routing/error-handling) at different levels/segments in route hierarchy.

For even more granular error handling use custom [ErrorBoundary](src/components/elementary/ErrorBoundary.tsx) component. ErrorBoundary is easily configurable client-side component that utilizes [react-error-boundary](https://github.com/bvaughn/react-error-boundary) package and catches errors in smaller parts of the UI or individual components. By default it wraps Strapi components as their content is fetched from CMS and don't guarantee correctness.

```tsx
import { ErrorBoundary } from "@/components/elementary/ErrorBoundary"

export default function Page() {
  return (
    <ErrorBoundary
      customErrorTitle="Uh-oh, we broke something! Again..."
      showErrorMessage
    >
      <StrapiNavbar />
    </ErrorBoundary>
  )
}
```

### Sentry logging

Errors passed through `<ErrorBoundary />` or `error.tsx` are automatically logged to Sentry. To turn Sentry on, set `NEXT_PUBLIC_SENTRY_DSN` to environment variables. `SENTRY_AUTH_TOKEN`, `SENTRY_ORG` and `SENTRY_PROJECT` are optional and serve for uploading source maps to Sentry during deployment. Uncaught errors are logged automatically.

Configuration is done in [sentry.client.config.ts](sentry.client.config.ts), [sentry.server.config.ts](sentry.server.config.ts), [sentry.edge.config.ts](sentry.edge.config.ts), [instrumentation.ts](src/instrumentation.ts) and [next.config.mjs](next.config.mjs) files. More information can be found in [Sentry documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/).

### Next Image

The Next.js `Image` component is performance-optimized but also demanding, so it must be used carefully, especially with SEO considerations. For a full understanding of how it works, refer to the [official documentation](https://nextjs.org/docs/app/api-reference/components/image). Review the current configuration in the [next.config.mjs](next.config.mjs) file.

The following image components are provided as wrappers around the native `Image` component:

1. `/src/components/elementary/ImageWithBlur.tsx` – Displays images with a synchronous blur effect. Ideal for improving UX and performance. Has no side effects.
2. `/src/components/elementary/ImageWithFallback.tsx` – A **client-only** enhancement of `ImageWithBlur`. It checks if the image is loaded and displays a fallback image if not. If both primary and secondary sources fail, it falls back to a local placeholder.
3. `/src/components/elementary/ImageWithPlaiceholder.tsx` – Uses [plaiceholder](https://plaiceholder.co/docs) to generate visually appealing placeholders asynchronously. Supports server-side rendering and fallback logic. If both primary and secondary images fail, it falls back to a local placeholder.

> [!INFO]
> ImageWithPlaiceholder is currently put on hold due to performance issues.

### reCAPTCHA v3

[reCAPTCHA v3](https://developers.google.com/recaptcha/docs/v3) is [preconfigured](./src/lib/recaptcha.ts) in the app. To enable it, set the `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` and `RECAPTCHA_SECRET_KEY` environment variables. Wrap your form with the `ReCaptchaProvider` component and use the `useReCaptcha` hook to execute reCAPTCHA. The resulting reCAPTCHA token should then be validated on the server side using the `validateRecaptcha` function.

```tsx
// server action

import { validateRecaptcha } from "@/lib/recaptcha"

export const submitContactUsForm = (payload: FormData) => {
  const recaptchaToken = payload.get("recaptchaToken")
  const isValid = await validateRecaptcha(recaptchaToken)

  if (!isValid) {
    throw new Error("Invalid reCAPTCHA token")
  }
}
```

```tsx
// Wrap form with reCAPTCHA provider

export default function Page() {
  import { ReCaptchaProvider } from "next-recaptcha-v3"
  import { ContactUsForm } from "@/components/forms/ContactUsForm"
  import { env } from "@/env.mjs"

  return (
    <ReCaptchaProvider reCaptchaKey={env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}>
      <ContactUsForm />
    </ReCaptchaProvider>
  )
}
```

```tsx
// Form component

import { useReCaptcha } from "next-recaptcha-v3"

import { submitContactUsForm } from "@/lib/actions"

export function ContactUsForm() {
  const { executeRecaptcha } = useRecaptcha()

  const onSubmit = async (data: FormData) => {
    const recaptchaToken = await executeRecaptcha("submit_form")
    data.append("recaptchaToken", recaptchaToken)
    submitContactUsForm(data)
  }

  return <form onSubmit={onSubmit}>{/* ... */}</form>
}
```
