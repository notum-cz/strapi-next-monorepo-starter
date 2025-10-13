# 🎵 Trail Mixx - Community Radio Streaming Platform

Trail Mixx is a production-ready monorepo for building community-focused internet radio stations. Built on Strapi v5, Next.js v15, and custom streaming services, it provides everything needed to launch a legal, accessible, and engaging radio platform that celebrates local artists, nonprofits, and BIPOC communities.

## 🥞 Tech Stack

- [Strapi v5](https://strapi.io/) - Headless CMS for content management
- [Next.js v15](https://nextjs.org/docs) - React framework with App Router
- [Shadcn/ui](https://ui.shadcn.com/) - Accessible UI components
- [TailwindCSS v4](https://tailwindcss.com/) - Utility-first styling
- [Turborepo](https://turbo.build/) - Monorepo orchestration
- [HLS.js](https://github.com/video-dev/hls.js/) - HTTP Live Streaming playback
- [Capacitor](https://capacitorjs.com/) - Native mobile wrapper
- [Node.js/Express](https://expressjs.com/) - Stream proxy service

## ✨ Features

- **HLS Audio Streaming** - Native HLS for Safari, hls.js fallback for other browsers
- **Bilingual Support** - Full English/Spanish UI and content localization (i18n)
- **Accessible Player** - WCAG 2.1 AA compliant with keyboard navigation and screen reader support
- **Mobile Apps** - iOS/Android via Capacitor with lock screen and Bluetooth controls
- **Content Management** - Strapi CMS with models for Promos, Merchants, Shows, and Tracks
- **Analytics Logging** - CSV-based play and ad tracking for royalty reporting
- **Auto-Fallback** - Switches to MP3 stream when HLS origin is down
- **Agent System** - Extensible A2A automation for mixing, scheduling, and content generation
- **Legal Compliance** - Documentation for SoundExchange, PROs, and non-interactive streaming rules

## 🚀 Getting Started

### Prerequisites

- **Docker** - For PostgreSQL database
- **Node.js 22** - Runtime environment
- **Yarn 1.22** - Package manager
- [nvm](https://github.com/nvm-sh/nvm) - Recommended for Node version management

### Quick Start (5 steps)

1. **Clone this repository**

   ```sh
   git clone https://github.com/executiveusa/strapi-template-v1.git trail-mixx
   cd trail-mixx
   ```

2. **Install dependencies**

   ```sh
   # Switch to Node 22
   nvm use

   # Install all workspace dependencies
   yarn
   ```

3. **Configure environment**

   ```sh
   # Copy example env files (auto-copied by postinstall)
   cp .env.example .env
   cp services/cms/.env.example services/cms/.env
   cp services/stream/.env.example services/stream/.env
   cp apps/web/.env.local.example apps/web/.env.local
   ```

4. **Start the database**

   ```sh
   cd services/cms
   docker compose up -d db
   cd ../..
   ```

5. **Run all services**

   > [!TIP]
   > Before first run, retrieve a [Strapi API token](https://docs.strapi.io/cms/features/api-tokens) after starting Strapi.
   
   **Terminal 1 - CMS:**
   ```sh
   yarn dev:cms
   ```
   Go to <http://localhost:1337/admin> and create an admin user. Then create a **Read-Only API Token** from Settings → API Tokens.

   **Terminal 2 - Stream Service:**
   ```sh
   yarn dev:stream
   ```

   **Terminal 3 - Web App:**
   ```sh
   # First, add the API token to apps/web/.env.local
   # STRAPI_REST_READONLY_API_KEY=your-token-here
   yarn dev:web
   ```

   **Or run all at once:**
   ```sh
   yarn dev
   ```

   **Access the apps:**
   - 🎵 **Player:** <http://localhost:3000/en/listen>
   - 🎛️ **CMS Admin:** <http://localhost:1337/admin>
   - 📊 **Stream Metrics:** <http://localhost:3001/metrics>
   - 🏠 **Website:** <http://localhost:3000/>

### Seed Sample Data

After starting the CMS, populate it with sample content:

```sh
# Make sure CMS is running first
node services/cms/scripts/seed/seed-data.js
```

This creates sample:
- Promos (nonprofit, BIPOC, event)
- Merchants (local businesses)
- Shows (radio programs)
- Tracks (music library)

### Next Steps

1. **Configure HLS:** Update `HLS_ORIGIN` in `services/stream/.env` with your stream URL
2. **Customize branding:** See [DESIGN_AUDIT.md](./DESIGN_AUDIT.md) for theme customization
3. **Review compliance:** Read [docs/compliance/README.md](./docs/compliance/README.md) before going live
4. **Build mobile apps:** Follow [apps/mobile/README.md](./apps/mobile/README.md) for iOS/Android builds

## ✨ Features

- **Strapi**: Fully typed (TypeScript) and up-to-date Strapi v5 controllers and services
- **Strapi config**: Pre-configured and pre-installed with the most common plugins, packages and configurations
- **Page builder**: Page rendering mechanism and prepared useful components. Ready to plug-and-play
- **Strapi live preview**: Preview/draft mode for Next.js app to see changes in Strapi in real-time
- **DB seed**: Seed script to populate DB with initial data
- **Next.js**: Fully typed and modern Next.js v15 App router project
- **Proxies**: Proxy API calls to Strapi from Next.js app to avoid CORS issues, hide API keys and backend address
- **API**: Typed API calls to Strapi via API clients
- **UI library**: 20+ pre-installed components, beautifully designed by [Shadcn/ui](https://ui.shadcn.com/)
- **UI components**: Ready to use components for common use cases (forms, images, tables, navbar and much more)
- **TailwindCSS**: [TailwindCSS v4](https://tailwindcss.com/) setup with configuration and theme, [CVA](https://cva.style/docs), [tailwind-merge](https://www.npmjs.com/package/tailwind-merge) and [tailwindcss-animate](https://www.npmjs.com/package/tailwindcss-animate)
- **CkEditor**: Pre-configured [CkEditor v5](https://ckeditor.com/) WYSIWYG editor with shared styles and colors
- **Utils**: Useful utils, hooks and helper functions included
- **Auth**: JWT authentication with [Strapi Users & Permissions feature](https://docs.strapi.io/cms/features/users-permissions) and [NextAuth.js](https://next-auth.js.org/), auth middleware and protected routes
- **Auth providers**: Ready to plug-in providers like Google, Facebook etc.
- **Localization**: Multi-language support with [next-intl](https://next-intl-docs.vercel.app/) and [@strapi/plugin-i18n](https://www.npmjs.com/package/@strapi/plugin-i18n) packages
- **SEO**: Pre-configured usage of [@strapi/plugin-seo](https://www.npmjs.com/package/@strapi/plugin-seo) and integrated with frontend SEO best practices like metadata, sitemap.xml or robots.txt
- **Turborepo**: Pre-configured, apps and packages connected and controlled by Turbo CLI
- **Dockerized**: Ready to build in Docker containers for production
- **Code quality**: Out-of-the-box ESLint, Prettier, and TypeScript configurations in shareable packages
- **Husky**: Pre-commit hooks for linting, formatting and commit message validation
- **Commitizen**: Commitizen for conventional commits and their generation
- **Heroku ready**: Ready to deploy to Heroku in a few steps
- ... and much more is waiting for you to discover!

## 📦 What's Inside?

### Apps

- `apps/web` - Next.js web app with HLS player and /listen page - [README.md](./apps/web/README.md)
- `apps/mobile` - Capacitor wrapper for iOS/Android with media controls - [README.md](./apps/mobile/README.md)

### Services

- `services/cms` - Strapi v5 CMS with i18n content types (Promo, Merchant, Show, Track) - [README.md](./services/cms/README.md)
- `services/stream` - HLS proxy with fallback MP3 and analytics logging - [README.md](./services/stream/README.md)

### Packages

- `packages/player-sdk` - Reusable React player component and embeddable widget - [README.md](./packages/player-sdk/README.md)
- `packages/eslint-config` - Shared ESLint configurations
- `packages/prettier-config` - Code formatting standards
- `packages/typescript-config` - TypeScript configurations
- `packages/design-system` - Shared styles and theme tokens
- `packages/shared-data` - Common constants and utilities

### Agents & Configs

- `agents/deepagents-runtime` - A2A agent auto-onboard system
- `configs/clocks` - Programming clock configurations (e.g., seattle-top-hour.json)
- `configs/rotations` - Music rotation policies (rotations.yaml)

### Documentation

- `docs/Agent-Cards` - Agent contract definitions for automation
- `docs/BMAD-Playbooks` - Operational playbooks (DailyOps, ContentGrowth)
- `docs/poml` - Protocol specifications (player.poml)
- `docs/spec-kit` - Acceptance criteria and testing requirements
- `docs/compliance` - Legal and licensing requirements

## 🚀 Deployment

### Web App (Vercel/Netlify)

**Vercel (Recommended):**
```sh
# Install Vercel CLI
npm i -g vercel

# Deploy from apps/web
cd apps/web
vercel
```

**Environment Variables:**
- `NEXT_PUBLIC_HLS_URL` - Your HLS stream URL
- `STRAPI_URL` - Strapi API URL
- `STRAPI_REST_READONLY_API_KEY` - Strapi API token
- `APP_PUBLIC_URL` - Your production URL

### CMS (Render/Fly.io)

**Render:**
1. Create a new Web Service
2. Connect your GitHub repo
3. Build command: `yarn build:cms`
4. Start command: `yarn start:cms`
5. Add PostgreSQL database
6. Set environment variables from `services/cms/.env.example`

**Fly.io:**
```sh
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Deploy
cd services/cms
fly launch
fly secrets set DATABASE_URL=your-db-url
fly deploy
```

### Stream Service (Render/Railway)

Deploy `services/stream` to any Node.js host:

**Render:**
1. Create new Web Service
2. Build: `yarn build:stream`
3. Start: `yarn start:stream`
4. Add persistent disk for CSV logs
5. Set `HLS_ORIGIN` and `FALLBACK_MP3`

**Environment Variables:**
- `PORT` - Service port (usually 3001)
- `HLS_ORIGIN` - Your HLS origin server
- `FALLBACK_MP3` - Fallback stream URL

### Mobile Apps

**iOS (requires macOS):**
```sh
cd apps/mobile
npx cap sync ios
npx cap open ios
# Build in Xcode
```

**Android:**
```sh
cd apps/mobile
npx cap sync android
npx cap open android
# Build in Android Studio
```

See [apps/mobile/README.md](./apps/mobile/README.md) for detailed instructions.

## 📚 Documentation

- [DESIGN_AUDIT.md](./DESIGN_AUDIT.md) - Design system, colors, typography, components
- [MIGRATION_NOTES.md](./MIGRATION_NOTES.md) - File mappings and breaking changes
- [CHANGELOG.md](./CHANGELOG.md) - Version history and changes
- [docs/compliance/](./docs/compliance/) - Legal requirements and licensing
- [docs/spec-kit/](./docs/spec-kit/) - Acceptance criteria and testing
- [docs/BMAD-Playbooks/](./docs/BMAD-Playbooks/) - Operational procedures

## 🤝 Contributing

This is a community-focused project. Contributions welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎵 Legal & Compliance

Operating an internet radio station requires proper licensing:

- **SoundExchange** - Statutory license for sound recordings (Sections 112 & 114)
- **ASCAP, BMI, SESAC** - Performance rights for musical compositions
- **State/Local** - Business registration and tax compliance

See [docs/compliance/README.md](./docs/compliance/README.md) for complete details.

⚠️ **Important:** Obtain all required licenses BEFORE broadcasting to the public.

## 💬 Support

- **Documentation:** Check the `/docs` folder for detailed guides
- **Issues:** Use GitHub Issues for bug reports and feature requests
- **Discussions:** Use GitHub Discussions for questions and community support

---

Built with ❤️ for local artists, nonprofits, and BIPOC communities.

## ☕ Turborepo scripts

After installing dependencies and setting env vars up, you can control all apps using Turbo CLI. Some common commands are wrapped into `yarn` scripts. You can find them in root [package.json](./package.json) file. For example:

```bash
# run all apps in dev mode (this triggers `yarn dev` script in each app from `/apps` directory)
yarn dev

# build all apps
yarn build

# dev run of specific app(s)
yarn dev:ui
yarn dev:strapi
```

## 🔌 VSCode Extensions

Install extensions listed in the [.vscode/extensions.json](.vscode/extensions.json) file and have a better development experience.

## 🔱 Husky tasks

Husky is installed by default and configured to run following tasks:

1. `lint` (eslint) and `format` (prettier) on every commit (`pre-commit` hook). To do that, [lint-staged](https://www.npmjs.com/package/lint-staged) library is used. This is a fast failsafe to ensure code doesn't get committed if it fails linting rules and that when it does get committed, it is consistently formatted. Running linters only on staged files (those that have been added to Git index using `git add`) is much faster than processing all files in the working directory. The `format` task is configured in root `.lintstagedrc.js` and run globally for whole monorepo. The `lint` task is configured in each app individually and Strapi is skipped by default.

2. `commitlint` on every commit message (`commit-msg` hook). It checks if commit messages meet [conventional commit](https://www.conventionalcommits.org/en/v1.0.0/) format.

## 📿 Scripts

### Package.json

- `yarn commit` - interactive commit message generator 🔥. How? Stage files you want to commit (e.g. using VS Code Source Control) and then run this script in the terminal from root and fill in the required information.
- `yarn format` - format code using prettier in whole monorepo. Prettier formats `package.json` files too.

### Utils

- `bash ./scripts/utils/rm-modules.sh` - Remove all `node_modules` folders in the monorepo. Useful for scratch dependencies installation.
- `bash ./scripts/utils/rm-all.sh` - Remove all `node_modules`, `.next`, `.turbo`, `.strapi`, `dist` folders.

## ♾️ CI/CD

### GitHub Actions

We are using `GitHub Actions` for continuous integration. The `CI` expects some variables (`APP_PUBLIC_URL`, `STRAPI_URL` and `STRAPI_REST_READONLY_API_KEY`) to be available on the runner, so make sure to add them in the repository's settings. Have a look at the [workflow](.github/workflows/ci.yml) definition for more details.

### Heroku

- `./scripts/heroku/heroku-postbuild.sh` - Script for Heroku deployment to decide which app to build. It can be removed if not deploying to Heroku.

## 💙 Feedback

This repository was created based on [strapi-next-monorepo-starter](https://github.com/notum-cz/strapi-next-monorepo-starter). If you encounter a problem with the template code during development, or you have implemented a useful feature that should be part of that template, please create an issue with a description or PR in that repository. So we can keep it updated with great features.
