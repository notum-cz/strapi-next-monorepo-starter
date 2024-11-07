# 🔥 UI Starter Template

This is a [Next.js v14](https://nextjs.org/docs/14) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## 🥞 Tech stack

- node 20
- yarn 1.22
- NextJS 14 App router
- React 18
- TypeScript
- [shadcn/ui](https://ui.shadcn.com/)
- [Lucide icons](https://lucide.dev)

## 📦 Included packages

- next-auth
- next-intl
- next-themes (for dark mode)
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

#### Transform this template to a project

To turn this project template into a project:

- Remove packages you don't need from `package.json` and reinstall dependencies.
- Remove `src/app/[locale]/docs` as it isn't needed in final app.
- Remove `src/app/[locale]/builder` and `src/components/page-builder` directories if builder isn't developed.

_[After this preparation is done, delete this section]_

### Environment variables

Copy & rename `.env.local.example` to `.env.local` and fill or update in the values.

### Run locally in dev mode (with hot-reloading)

To run the app locally use:

```bash
(nvm use) # switch node version
(yarn) # deps are probably already installed running `yarn` in root

yarn dev
```

App runs on [http://localhost:3000](http://localhost:3000) by default.

## 🛠️ Production build (Docker)

To build and run NextJS in Docker container use [Dockerfile](Dockerfile) prepared for **production** environment. It follows recommended way of running app in Turborepo monorepo structure. Note, that Turborepo requires access to root `package.json`, `yarn.lock` and `turbo.json` files so you have to build it within whole monorepo context - run `docker build` from monorepo root. [More info here](https://turbo.build/repo/docs/handbook/deploying-with-docker).

```bash
# from monorepo root

# build image and name it
docker build -t ui:latest -f apps/ui/Dockerfile .

# run container using image
docker run -it --rm --name ui -p 3000:3000 --env-file apps/ui/.env ui:latest
```

To change port, set `PORT` env variable in `.env` file and in `docker run` command (`-p` flag means port mapping between host:container).

Dockerfile assumes that NextJS app is ["outputed"](https://nextjs.org/docs/14/app/api-reference/next-config-js/output) in `standalone` mode (see [next.config.mjs's output option](next.config.mjs) for details), which is useful for self-hosting in a Docker container (includes only necessary files and dependencies). It is controlled using `NEXT_OUTPUT` env variable. Any other value than `standalone` will require changes in Dockerfile (eg. `runner` stage).

### Output modes

NextJS has three `output` modes:

- `export` - static HTML/CSS/JS files [are generated at build time](https://nextjs.org/docs/14/app/building-your-application/deploying/static-exports) and served by any static hosting/CDN. No Node.js server is needed. [Dynamic logic is not supported](https://nextjs.org/docs/14/app/building-your-application/deploying/static-exports#unsupported-features). This mode is **not supported** in this starter repo because of the dynamic nature (NextAuth and [POST endpoint](src/app/api/auth/[...nextauth]/route.ts))
- `standalone` - useful for self-hosting in a Docker container (see above) because it includes only necessary files and dependencies
- `undefined` - default build output, `.next` directory, that works with production mode `next start` or a hosting provider like Vercel and requires Node.js server

### Data revalidation (ISR)

This allows to update static content without rebuilding the entire site. Data revalidation doesn't work in plain static `export` output mode as the app is static and doesn't have a server to revalidate data. ISR speed up the app and reduces the load on the server.

In this starter template, we use ISR with time-based revalidation by default. Revalidation is added globally to all fetch requests, but can be controlled individually through parameters of fetch functions (see [Strapi client](src/lib/strapi.ts)). Interval can be controlled using `NEXT_PUBLIC_REVALIDATE` env variable and is set to 0 (no cache) during development.

[More information about ISR](https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration)

## 🚢 Deploy to Heroku

Use buildpacks and setup scripts from [this @notum-cz repository](https://github.com/notum-cz/heroku-scripts). Working `output` mode for app built and served from Heroku is default - `undefined`. App contains all files/dependencies and is started using `next start`.

## ⛺ Included code

There is a lot of code prepared in this template:

- `src/app/[locale]` - pages for authorization, builder, docs, profile page
- `src/components` - the most common components

For more details see [project structure](#project-structure) section below.

Not all of them are needed in the final app, so you should remove unnecessary parts. There is a function `removeThisWhenYouNeedMe` which is called at the top of each route or component and logs a warning message to the console. It serves to identify unused parts of the code. If the function, components or page is needed, you should remove the function call. Code with remaining `removeThisWhenYouNeedMe` calls should be removed as development progresses.

## 🧬 Project structure

- `src/app` - NextJS App router main application. Components related to specific `page` (e.g. usage is only that page or its nested pages) should be placed in `src/pageName/_components` folder. eg. don't place `SignInForm` component in shared folder (e.g. `src/components/forms`) as it is used only in one page.
- `src/components` - shared components, which are used in multiple pages or globally (like providers). Divide them into folders based on their purpose, e.g:
  - `src/components/forms` - stuff related to forms (form wrappers, different type of fields etc.)
  - `src/components/elementary` - very basic or more complex standalone components, which can be used everywhere
  - `src/components/ui` - Tailwind wrappers around RadixUI components created by shadcn/ui library. This directory is **controlled** by shadcn. You can change the content of individual files (eg. to adjust design or fix problems), but do not rename the entire folder or component files. [More info here](#shadcn)
  - `src/components/page-builder` - components related to Strapi page builder. [More info here](#strapi-page-builder)
- `src/hooks` - custom hooks
- `src/lib` - shared functions, utils and helpers for auth, theme, i18n, dates, navigation, etc.
- `src/lib/strapi.ts` - static class for fetching data from Strapi API
- `src/locales` - localization files
- `src/styles` - global styles
- `src/types` - types (global, api, etc.)

### shadcn

Shadcn/ui is a simple ui library that uses the functionality of RadixUI components and Tailwindcss for styling. You can find the list of components in the [docs](https://ui.shadcn.com/docs/components). Many of them are pre-installed by default in this project. If you need to add something, you can do it by manual copy and paste from the docs or by calling the CLI command (preferred option).

For example, to add an [accordion component](https://ui.shadcn.com/docs/components/accordion) to the project call `npx shadcn-ui@latest add accordion` in this directory. The component will be added to the `components/ui` folder (as declared in [shadcn config file](https://ui.shadcn.com/docs/components-json) called [components.json](components.json)). From there it can be imported or its source code can be directly edited.

#### Themes

It is possible to build your own theme at [https://ui.shadcn.com/themes](https://ui.shadcn.com/themes). There you can set the global style of components, color, radius, export and insert the whole thing into project. More details are in the [docs](https://ui.shadcn.com/docs/theming). Related files:

- `styles/globals.css` - project theme
- `tailwind.config.js` - tailwind configuration. [Tailwindcss-animate](https://github.com/jamiebuilds/tailwindcss-animate) plugin is included by default.

To merge several Tailwind classes and to work more conveniently with dynamic classes, **strictly use** the `cn` function declared in [lib/styles.ts](src/lib/styles.ts).

```tsx
import { cn } from "@/lib/styles"

;<div className={cn("flex items-center justify-center", className)}>...</div>
```

## ✨ Features

### Authorization

App uses `next-auth` package, which is configured in [src/lib/auth.ts](src/lib/auth.ts) and [src/app/api/auth/[...nextauth]/route.ts](src/app/api/auth/[...nextauth]/route.ts).

In [middleware.ts](src/middleware.ts) file, there is `authMiddleware` which is used to determine if user is authenticated or not. There is `publicPages` variable which contains array of routes that are public and don't require authentication. If user is not authenticated and tries to access private route, he is redirected to login page.

To get session (logged user) in server components use `getAuth()` helper:

```ts
import { getAuth } from "@/lib/auth"

export default async function ProfilePage() {
  const session = await getAuth()
  const user = session?.user.data

  return <div></div>
}
```

To get session (logged user) in client components use `useSession()` from `next-auth`:

```tsx
"use client"

import { useSession } from "next-auth/react"

export default function ProfilePage() {
  const session = useSession()
  const user = session.data?.user

  return <div></div>
}
```

### Localization

App is ready for localization. It uses `next-intl` package with basic configuration. For more in-depth configuration, see the [docs](https://next-intl-docs.vercel.app/docs/getting-started/app-router). Relevant files:

- Next-intl plugin is defined in [src/lib/i18n.ts](src/lib/i18n.ts) and used by [src/middleware.ts](src/middleware.ts) and registered in [next.config.mjs](next.config.mjs)
- locales (messages) in `locales/*`
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

Define them in `.env.local.example`, `.env.local` and `src/env.mjs` file where [@t3-oss/env-nextjs](https://github.com/t3-oss/t3-env) validation package is used. This package is used to validate and type-check environment variables.

Usage:

```tsx
import { env } from "@/env.mjs"

// ✅ OK
console.log(env.NEXT_PUBLIC_STRAPI_URL)

// ❌ NOT OK
console.log(process.env.NEXT_PUBLIC_STRAPI_URL)
```

### Error handling

General unexpected **rendering** and **lifecycle** errors (not event handlers, not async code) are automatically caught by boundary defined in root [error.tsx](src/app/[locale]/error.tsx). This file [can be defined](https://nextjs.org/docs/14/app/building-your-application/routing/error-handling) at different levels/segments in route hierarchy.

For even more granular error handling use custom [ErrorBoundary](src/components/elementary/ErrorBoundary.tsx) component. ErrorBoundary is easily configurable client-side component that utilizes [react-error-boundary](https://github.com/bvaughn/react-error-boundary) package and catches errors in smaller parts of the UI or individual components. By default it wraps Strapi components as their content is fetched from CMS and don't guarantee correctness.

```tsx
import { ErrorBoundary } from "@/components/elementary/ErrorBoundary"

export default function Page() {
  return (
    <ErrorBoundary
      customErrorTitle="Uh-oh, we broke something! Again..."
      showErrorMessage
    >
      <PageBuilderNavbar />
    </ErrorBoundary>
  )
}
```

#### Sentry logging

Errors passed through `<ErrorBoundary />` or `error.tsx` are automatically logged to Sentry. To turn Sentry on, set `NEXT_PUBLIC_SENTRY_DSN` to environment variables. `SENTRY_AUTH_TOKEN`, `SENTRY_ORG` and `SENTRY_PROJECT` are optional and serve for uploading source maps to Sentry during deployment. Uncaught errors are logged automatically.

Configuration is done in [sentry.client.config.ts](sentry.client.config.ts), [sentry.server.config.ts](sentry.server.config.ts), [sentry.edge.config.ts](sentry.edge.config.ts), [instrumentation.ts](src/instrumentation.ts) and [next.config.mjs](next.config.mjs) files. More information can be found in [Sentry documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/).

### Data fetching

To fetch data from API use `Strapi` class defined in [lib/strapi.ts](src/lib/strapi.ts). Basically, it is wrapper around native `fetch()` with pre-configured base path, token management, headers manipulation and exposed fetch functions to `fetchAPI`, `fetchOne`, `fetchMany`, `fetchAll` or `fetchOneBySlug`:

- `fetchAPI` - the most general function to get (or post, put...) data from the API. It can be used at any time, but the return type must be typed manually. This function is useful when:
  - data is fetched from/to a custom Strapi endpoint (e.g. `GET /users/my-logic-endpoint`)
  - data is not related to any Strapi content type
  - it's already in use by different handler (e.g. content type `"plugin::users-permissions.user"` is reserved for `GET /users` so `GET /users/me` has to use `fetchAPI` - see bellow):

```ts
import { Result } from "@repo/strapi"

const fetchedUser: Result<"plugin::users-permissions.user"> =
  await Strapi.fetchAPI("/users/me", undefined, undefined, {
    strapiJWT: token.strapiJWT,
  })
```

- `fetchOne`, `fetchMany`, `fetchAll` or `fetchOneBySlug` - these functions are linked directly to Strapi content types. This means that during the call it is necessary to specify the UUID (`"api::", "admin::"` etc.) of `ContentType` you want to fetch. Based on this, the response is automatically typed. **To make this working** you have to maintain a mapping between `ContentType` UUID and endpoint URL path - see `API_ENDPOINTS` object in [lib/strapi.ts](src/lib/strapi.ts) file.

> [!WARNING]
> All attributes (and relations) are currently typed as optional (`... | null | undefined`) even if they are required in Strapi. This is current limitation of automatic typing inference and needs to be improved in future versions of this template.

In client React components/hooks use `useQuery` (or `useMutation`) hook from `@tanstack/react-query` to query/mutate data in reactive way. In server components call endpoint directly and fetch data (`/GET` endpoints) on NextJS server side - e.g. in `getData()` function or in component's body.

Next's [server actions](https://nextjs.org/docs/14/app/building-your-application/data-fetching/server-actions-and-mutations) are not used in this project.

An example of how to fetch data from API and render it in component is shown in [Configuration component](src/app/[locale]/_components/Configuration.tsx).

#### Authorization in API

Strapi API endpoints are usually protected by JWT token. To fetch data from protected API, you have to pass the token in the `Authorization` header of the request. The token is stored in the NextAuth session object, which is returned by `getAuth()` function (RSC) or `useSession()`/`await getSession()` in client components.

To avoid passing the token manually in each request (into `fetch` functions above), you can leverage the `Strapi.prepareHeader()` function, which tries to get the token from the session according to the request context (server or client) and adds it to the headers automatically.

In client components `Strapi` uses `getSession()` which first makes HTTP request to NextAuth's `/api/auth/session` endpoint to get the session object and then makes the actual request to Strapi API. This isn't optimal but `useSession()` hook doesn't work outside of React components and currently you haven't implemented a better way to get the session on the client side. As a workaround (in most cases this additional request is not problematic), you can pass the `strapiJWT` directly to the `fetch` functions as shown in the example below.

To omit `Authorization` header and token detection, you can pass `omitAuthorization: true` in the `options` object of `fetchAPI` function. Token detection is dynamic operation so it blocks static rendering of the page.

```ts
"use client"

import { useSession } from "next-auth/react"
import API from "@/lib/api"

export function UserProfile(){
  const session = useSession()

  const updateUser = async () => {
    await API.fetchAPI(
      `/users/${id}`,
      undefined,
      { body: JSON.stringify(data), method: "PUT" },
      // pass token from `useSession` directly to prevent additional request from browser to get session
      { strapiJWT: session.data?.strapiJWT }
    )
  }

  return <button onClick={updateUser}>Update</button>
}
```

### Strapi page builder

#### Handler

By default, page builder landing page is rendered inside [/builder route](src/app/[locale]/builder/page.tsx). Pages created in Strapi DB are then rendered as nested URLs based on their slug (e.g. `/builder/page-slug-from-strapi`). If you need to remove "/builder" from URL and run page builder on the root page, you have to:

- move [[...rest]](src/app/[locale]/builder/[...rest]) directory to the root [src/app/[locale]](src/app/[locale]) or change the name of "builder" directory to `(builder)` and fix multiple `page.tsx` files
- in [StrapiPage](src/app/[locale]/builder//[...rest]//page.tsx) change code that filters out "builder" word from URL (2 places).

#### Flow

To add new Strapi component/single type to the frontend, follow these steps:

1. define new entity and its attributes in Strapi
2. implement new entity into UI component, add required styling and save it into custom file in one of [src/components/page-builder](src/components/page-builder) folders.
   - component should always except `component` as prop with type based on Strapi typing
   - do NOT create typing for Strapi entities manually, use directly Strapi typing which is available by default as feature of monorepo setup
   - keep name of frontend component in sync with Strapi component name
3. add new component to `printableComps` mapping in [src/components/page-builder/ComponentsRenderer](src/components/page-builder/ComponentsRenderer.tsx)
   - add only "section" (=page level) components to this map
   - "shared" components (small pieces of UI which are used in multiple bigger components) are not usually included in this map (they don't have any "section" level styling)
   - single types are handled separately (fetched and rendered at specific position in the page), so they are not part of this map too
4. That's it! Now, add new component to some Page (`api::page:page`) in Strapi and it should be automatically rendered on frontend.

Following components are already implemented and can be used:

#### Components

- "sections.animated-logo-row" -> AnimatedLogoRow,
- "sections.carousel" -> CarouselGrid,
- "sections.contact-form" -> ContactFormSection,
- "sections.faq" -> Faq,
- "sections.feature-grid" -> FeatureGrid,
- "sections.heading-with-cta-button" -> HeadingWithCTAButton,
- "sections.hero" -> Hero,
- "sections.horizontal-images" -> HorizontalImages,
- "sections.image-with-cta-button" -> ImageWithCTAButton,
- "sections.newsletter" -> Newsletter,
- "shared.basic-image" -> BasicImage
- "shared.image-with-link" -> ImageWithLink
- "shared.link" -> LinkStrapi
- "layout.navbar" -> available to override global "api::navbar.navbar" for specific page

[src/components/page-builder/components](src/components/page-builder/components)

#### Single types

- "api::footer.footer" -> PageBuilderFooter
- "api::navbar.navbar" -> PageBuilderNavbar

[src/components/page-builder/singleTypes](src/components/page-builder/singleTypes)

#### Collection Types

- "api::page.page" -> StrapiPage (main page builder page)

[src/app/[locale]/builder/[...rest]](src/app/[locale]/builder/[...rest])

### Next Image

Next Image is a very demanding component, so it needs to be approached with caution, keeping in mind that you must also consider SEO. For studying how next image works see [https://nextjs.org/docs/14/app/api-reference/components/image](https://nextjs.org/docs/14/app/api-reference/components/image). It's important to also look into the [next.config](next.config.mjs) file for current settings.

Following image components are prepared. They all are wrapper around the Next Image component.

1. [ImageWithBlur](src/components/elementary/ImageWithBlur.tsx) - this component is used to display images with blur effect in synchronous way. Good for UX and optimalization. No side effects.
2. [ImageWithFallback](src/components/elementary/ImageWithFallback.tsx) - this component is used to display images with fallback to placeholder. It's **client-only** upgrade of `ImageWithBlur`. Firstly, it checks if image is loaded and if not, it displays fallback image. If primary and secondary images fail to load, it displays local placeholder as last resort.
3. [ImageWithPlaiceholder](src/components/elementary/ImageWithPlaiceholder.tsx) - this component uses [https://plaiceholder.co/docs](https://plaiceholder.co/docs) to generate beautiful image placeholders in asynchronous way. It supports server-side rendering and handles fallback/secondary images too. If primary and secondary images fail to load, it displays local placeholder as last resort.
