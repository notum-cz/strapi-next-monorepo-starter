# Site Index - New World Kids Platform

**Generated:** 2025-10-29
**Repository:** executiveusa/strapi-template-new-world-kids
**Stack:** Next.js 15 (App Router) + Strapi 5 + Turborepo

---

## 📋 Table of Contents

1. [Pages & Routes Map](#pages--routes-map)
2. [UI Components Inventory](#ui-components-inventory)
3. [Data Flow Map](#data-flow-map)
4. [API Routes](#api-routes)
5. [Layouts & Templates](#layouts--templates)

---

## 🗺️ Pages & Routes Map

### App Router Structure

The application uses Next.js 15 App Router with internationalization (i18n) support via `next-intl`.

#### Root Layout Hierarchy

```
app/
├── (platform)/              # Platform routes (no locale prefix)
│   ├── cockpit/            # AI Agent control panel
│   ├── blog/               # Blog posts
│   ├── donate/             # Donation flow
│   └── impact/             # Impact dashboard
│
└── [locale]/               # Internationalized routes
    ├── [[...rest]]/        # Catch-all for Strapi CMS pages
    ├── auth/               # Authentication flows
    ├── listen/             # Audio streaming
    └── player/             # Media player
```

---

### Public Routes (Localized)

#### **Dynamic CMS Pages** `[locale]/[[...rest]]`
- **Pattern:** `/{locale}/{any-path}`
- **Examples:**
  - `/en/about`
  - `/en/contact`
  - `/es/sobre-nosotros`
- **Data Source:** Strapi `page` collection
- **Dynamic:** Fully content-managed via Strapi CMS
- **File:** `apps/web/src/app/[locale]/[[...rest]]/page.tsx`
- **Features:**
  - Dynamic routing based on Strapi slugs
  - i18n support for multiple locales
  - SEO metadata from CMS
  - Component-based content zones

---

### Authentication Routes `[locale]/auth`

| Route | File | Purpose | Public |
|-------|------|---------|--------|
| `/auth` | `auth/page.tsx` | Auth landing | ✅ |
| `/auth/signin` | `auth/signin/page.tsx` | Sign in form | ✅ |
| `/auth/register` | `auth/register/page.tsx` | User registration | ✅ |
| `/auth/forgot-password` | `auth/forgot-password/page.tsx` | Password reset request | ✅ |
| `/auth/reset-password` | `auth/reset-password/page.tsx` | Password reset form | ✅ |
| `/auth/change-password` | `auth/change-password/page.tsx` | Change password (auth) | 🔒 |
| `/auth/activate` | `auth/activate/page.tsx` | Account activation | ✅ |
| `/auth/signout` | `auth/signout/page.tsx` | Sign out | 🔒 |

**Layout:** `apps/web/src/app/[locale]/auth/layout.tsx`
**Features:**
- NextAuth.js integration
- Form validation with React Hook Form + Zod
- reCAPTCHA v3 protection
- Supabase auth backend

---

### Media & Streaming Routes

| Route | File | Purpose | Public |
|-------|------|---------|--------|
| `/listen` | `[locale]/listen/page.tsx` | Audio streaming interface | ✅ |
| `/player` | `[locale]/player/page.tsx` | Media player page | ✅ |

**Features:**
- HLS.js integration for live streaming
- Fallback MP3 playback
- Stream proxy via `/api/public-proxy`

---

### Platform Routes `(platform)`

These routes bypass i18n routing for consistency across all locales.

#### **Cockpit Dashboard** `/cockpit`

| Route | File | Purpose | Auth Required |
|-------|------|---------|---------------|
| `/cockpit` | `(platform)/cockpit/page.tsx` | Agent control panel | 🔒 |
| `/cockpit/observability` | `(platform)/cockpit/observability/page.tsx` | Real-time logs & monitoring | 🔒 |
| `/cockpit/agents/[name]` | `(platform)/cockpit/agents/[name]/page.tsx` | Individual agent interface | 🔒 |

**Features:**
- Real-time agent status tracking
- Live log streaming via Supabase
- Agent execution interface
- GameUI components (futuristic UI)

**Dynamic Segment:** `[name]` = Agent name (indigo, mari, azul, beyond, duo, neo)

---

#### **Blog** `/blog/[slug]`

| Route | File | Purpose | Public |
|-------|------|---------|--------|
| `/blog/[slug]` | `(platform)/blog/[slug]/page.tsx` | Blog post detail | ✅ |

**Data Source:** Strapi `blog-post` collection
**Dynamic Segment:** `[slug]` = Post URL slug

---

#### **Donation Flow** `/donate`

| Route | File | Purpose | Public |
|-------|------|---------|--------|
| `/donate` | `(platform)/donate/page.tsx` | Donation interface | ✅ |

**Features:**
- Solana wallet integration
- NFT receipt minting
- Blockchain transaction tracking
- IPFS metadata storage

---

#### **Impact Dashboard** `/impact`

| Route | File | Purpose | Public |
|-------|------|---------|--------|
| `/impact` | `(platform)/impact/page.tsx` | Project impact metrics | ✅ |

**Features:**
- Real-time project funding status
- 4 active projects tracked
- Progress visualization
- Mission-aligned metrics

---

### Special Files

| File | Purpose |
|------|---------|
| `app/sitemap.ts` | Dynamic XML sitemap generation |
| `app/robots.ts` | Dynamic robots.txt generation |
| `app/[locale]/loading.tsx` | Loading UI skeleton |
| `app/[locale]/error.tsx` | Error boundary |
| `app/[locale]/not-found.tsx` | 404 page |

---

## 🎨 UI Components Inventory

### Design System (`packages/design-system`)

Shared component library used across the monorepo.

---

### shadcn/ui Components (`apps/web/src/components/ui`)

**Total:** 50+ components based on Radix UI primitives

#### Form & Input Components
- `button.tsx` - Button with variants (default, destructive, outline, ghost, link)
- `input.tsx` - Text input with label integration
- `textarea.tsx` - Multi-line text input
- `checkbox.tsx` - Checkbox with Radix UI
- `radio-group.tsx` - Radio button group
- `select.tsx` - Dropdown select
- `switch.tsx` - Toggle switch
- `slider.tsx` - Range slider
- `input-otp.tsx` - One-time password input
- `form.tsx` - Form wrapper with validation
- `label.tsx` - Form label
- `calendar.tsx` - Date picker calendar
- `date-picker.tsx` - Date selection component

#### Layout Components
- `card.tsx` - Card container (Header, Content, Footer)
- `accordion.tsx` - Collapsible sections
- `tabs.tsx` - Tab navigation
- `dialog.tsx` - Modal dialog
- `sheet.tsx` - Slide-out panel
- `drawer.tsx` - Bottom drawer
- `separator.tsx` - Horizontal/vertical divider
- `scroll-area.tsx` - Custom scrollable area
- `aspect-ratio.tsx` - Maintain aspect ratio
- `resizable.tsx` - Resizable panels

#### Navigation Components
- `navigation-menu.tsx` - Main navigation
- `menubar.tsx` - Menu bar
- `dropdown-menu.tsx` - Dropdown menu
- `context-menu.tsx` - Right-click menu
- `breadcrumb.tsx` - Breadcrumb navigation
- `pagination.tsx` - Page pagination
- `command.tsx` - Command palette (⌘K style)

#### Feedback Components
- `alert.tsx` - Alert message box
- `alert-dialog.tsx` - Confirmation dialog
- `toast.tsx` - Toast notifications
- `sonner.tsx` - Alternative toast system
- `progress.tsx` - Progress bar
- `skeleton.tsx` - Loading skeleton
- `spinner.tsx` - Loading spinner

#### Display Components
- `avatar.tsx` - User avatar with fallback
- `badge.tsx` - Status badge
- `tooltip.tsx` - Hover tooltip
- `popover.tsx` - Popover content
- `hover-card.tsx` - Hover card
- `carousel.tsx` - Image/content carousel
- `chart.tsx` - Chart visualization
- `table.tsx` - Data table

#### Utility Components
- `collapsible.tsx` - Collapsible content
- `toggle.tsx` - Toggle button
- `toggle-group.tsx` - Toggle button group
- `sonner.tsx` - Toast notifications

---

### Custom Components (`apps/web/src/components`)

#### **Cockpit Components** (`components/cockpit`)

**Purpose:** AI Agent control interface with game-like UI

- `GameUI/` - Futuristic game-style interface components
  - Real-time status displays
  - Agent execution controls
  - Log streaming components

**Key Features:**
- Three.js 3D visualizations
- Framer Motion animations
- Real-time Supabase subscriptions

---

#### **Editor Components** (`components/editor`)

**Purpose:** Page builder and content editor

- `action-bar/` - Editor toolbar and actions
- `theme-preview/` - Live theme preview
- `ai/` - AI-assisted editing tools
- Code editor integration
- Color picker
- Font picker
- Theme preset selector
- Share dialog

**Total Files:** 38+ editor-specific components

---

#### **Elementary Components** (`components/elementary`)

**Purpose:** Reusable building blocks

- `ck-editor/` - CKEditor integration for Strapi
- `data-table/` - TanStack Table components
- `forms/` - Form components with validation
- `StrapiPreviewListener/` - Draft preview system

---

#### **AI Elements** (`components/ai-elements`)

**Purpose:** AI/ML visualization components

- Agent status indicators
- Real-time data visualizations
- Interactive AI feedback

---

#### **Home Components** (`components/home`)

**Purpose:** Landing page components

- Hero sections
- Feature showcases
- Call-to-action blocks

---

#### **Impact Components** (`components/impact`)

**Purpose:** Impact dashboard widgets

- Project cards
- Funding progress bars
- Metrics displays

---

#### **Example Components** (`components/examples`)

**Purpose:** Reference implementations

- `music/` - Music player example
- `dashboard/` - Dashboard example
- `tasks/` - Task manager example
- `cards/` - Card layouts
- `pricing/` - Pricing tables
- `mail/` - Mail client example

---

### Provider Components (`components/providers`)

- `ClientProviders.tsx` - Client-side providers (Theme, Toast, Query)
- `ServerProviders.tsx` - Server-side providers
- `TrackingScripts.tsx` - Analytics tracking

---

## 📊 Data Flow Map

### UI → API → Strapi Flow

```
┌─────────────────┐      ┌──────────────┐      ┌─────────────┐
│   Next.js UI    │─────▶│  API Proxy   │─────▶│   Strapi    │
│   Components    │      │   Routes     │      │     CMS     │
└─────────────────┘      └──────────────┘      └─────────────┘
        │                        │                      │
        │                        │                      │
    React Query           Next.js API          PostgreSQL
     Zustand               Routes            + Supabase
```

---

### Public API Routes

**Base:** `/api/public-proxy/[...slug]`

**Purpose:** Proxy public Strapi REST API calls

**Flow:**
1. UI component calls `PublicStrapiClient.fetch()`
2. Request routed to `/api/public-proxy/{endpoint}`
3. API route forwards to Strapi with read-only token
4. Response cached and returned to UI

**Example:**
```typescript
// UI Component
const { data } = await PublicStrapiClient.getPageBySlug('about')

// Proxied to → /api/public-proxy/api/pages?filters[slug][$eq]=about
// → Strapi → http://localhost:1337/api/pages?filters[slug][$eq]=about
```

---

### Private API Routes

**Base:** `/api/private-proxy/[...slug]`

**Purpose:** Authenticated Strapi API calls

**Flow:**
1. UI component calls `PrivateStrapiClient.fetch()`
2. NextAuth session validated
3. Request routed to `/api/private-proxy/{endpoint}`
4. API route forwards with full permissions
5. Response returned to UI

**Use Cases:**
- Draft content preview
- User profile updates
- Administrative actions

---

### Strapi Data Collections

#### **Public Collections**

| Collection | Endpoint | Purpose | Localized |
|-----------|----------|---------|-----------|
| `page` | `/api/pages` | Dynamic pages | ✅ |
| `navbar` | `/api/navbar` | Navigation config | ✅ |
| `footer` | `/api/footer` | Footer config | ✅ |
| `blog-post` | `/api/blog-posts` | Blog content | ❌ |
| `show` | `/api/shows` | Media shows | ❌ |
| `track` | `/api/tracks` | Audio tracks | ❌ |
| `merchant` | `/api/merchants` | Merchant listings | ❌ |
| `promo` | `/api/promos` | Promotional content | ❌ |

#### **Single Types**

| Type | Endpoint | Purpose | Localized |
|------|----------|---------|-----------|
| `global` | `/api/global` | Site-wide settings | ✅ |
| `homepage` | `/api/homepage` | Homepage data | ✅ |

---

### State Management

#### **Client-Side State (Zustand)**

**Stores:**
- Theme state (dark/light mode)
- User preferences
- UI state (sidebar, modals)
- Agent status (cockpit)

#### **Server State (TanStack Query)**

**Queries:**
- Strapi content fetching
- Real-time agent data
- Supabase subscriptions

**Mutations:**
- Form submissions
- Agent executions
- Blockchain transactions

---

### Authentication Flow

```
┌──────────────┐      ┌────────────────┐      ┌─────────────┐
│  Next.js UI  │─────▶│  NextAuth API  │─────▶│  Supabase   │
│  Components  │      │ /api/auth/*    │      │    Auth     │
└──────────────┘      └────────────────┘      └─────────────┘
        │                      │                      │
        │                      │                      │
    Session Cookie        JWT Tokens           PostgreSQL
```

**Providers:**
- Credentials (email/password)
- OAuth (configurable)

**Files:**
- `/apps/web/src/lib/auth.ts` - NextAuth configuration
- `/apps/web/src/lib/supabase/client.ts` - Supabase client

---

## 🔌 API Routes

### Next.js API Routes (`apps/web/src/app/api`)

| Route | Method | Purpose | Auth |
|-------|--------|---------|------|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth handler | ✅ |
| `/api/public-proxy/[...slug]` | GET/POST | Public Strapi proxy | ❌ |
| `/api/private-proxy/[...slug]` | GET/POST | Private Strapi proxy | ✅ |
| `/api/asset/[...slug]` | GET | Asset delivery proxy | ❌ |
| `/api/preview` | GET | Draft preview mode | ✅ |
| `/api/agents/execute` | POST | Generic agent execution | ✅ |
| `/api/agents/[name]/execute` | POST | Specific agent execution | ✅ |
| `/api/blockchain/donate` | POST | Blockchain donation | ❌ |

---

### Agent API Routes

**Base:** `http://localhost:3004` (Stellar Agents Service)

| Route | Method | Purpose |
|-------|--------|---------|
| `/health` | GET | Service health check |
| `/agents` | GET | List all agents |
| `/agents/:name` | GET | Get agent info |
| `/agents/:name/execute` | POST | Execute agent task |

**Available Agents:**
- `indigo` - Navigator/Orchestrator
- `mari` - Coder
- `azul` - Validator
- `beyond` - Researcher
- `duo` - Communicator
- `neo` - Builder

---

### Stream API Routes

**Base:** `http://localhost:3001` (Stream Service)

| Route | Method | Purpose |
|-------|--------|---------|
| `/live/index.m3u8` | GET | HLS playlist |
| `/live/*.ts` | GET | HLS segments |
| `/healthz` | GET | Health check |
| `/metrics` | GET | Analytics metrics |

---

### Blockchain API Routes

**Base:** `http://localhost:3002` (Blockchain Service)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/blockchain/donate` | POST | Create donation |
| `/api/donations/:id` | GET | Get donation status |
| `/api/nft/mint` | POST | Mint NFT receipt |

---

## 📐 Layouts & Templates

### Root Layout

**File:** `apps/web/src/app/[locale]/layout.tsx`

**Features:**
- HTML lang attribute (i18n)
- Theme provider
- Font loading (Space Grotesk, Orbitron, Inter)
- Toast notifications
- Sentry error tracking

---

### Auth Layout

**File:** `apps/web/src/app/[locale]/auth/layout.tsx`

**Features:**
- Centered content
- Minimal navigation
- Background styling

---

### Platform Layout

**File:** `apps/web/src/app/(platform)/layout.tsx` (if exists)

**Features:**
- Full-width content
- No locale prefix
- Shared across platform routes

---

### Dynamic Page Layout

**File:** `apps/web/src/app/[locale]/[[...rest]]/layout.tsx`

**Features:**
- Strapi-managed navigation
- SEO metadata injection
- Dynamic breadcrumbs

---

## 🔍 Key Features

### Internationalization (i18n)

- **Library:** `next-intl` v3.26.5
- **Locales:** Configured via Strapi
- **Default:** English (en)
- **File:** `apps/web/src/lib/navigation.ts`

### SEO

- **Dynamic sitemap:** `app/sitemap.ts`
- **Dynamic robots.txt:** `app/robots.ts`
- **Meta tags:** Pulled from Strapi CMS
- **OpenGraph:** Automatic generation

### Performance

- **Image Optimization:** Sharp v0.33.5
- **Caching:** TanStack Query with stale-while-revalidate
- **Code Splitting:** Automatic via Next.js
- **Edge Functions:** Vercel Edge Runtime support

### Monitoring

- **Error Tracking:** Sentry integration
- **Real-time Logs:** Supabase subscriptions
- **Agent Observability:** Custom dashboard at `/cockpit/observability`

---

## 📦 Key Dependencies

### UI/UX
- **Next.js:** 15.4.7
- **React:** 18.3.1
- **Tailwind CSS:** 4.0.9
- **Framer Motion:** 11.18.2
- **Three.js:** 0.180.0
- **Radix UI:** Multiple primitives

### Data Management
- **TanStack Query:** 5.59.16
- **TanStack Table:** 8.20.5
- **Zustand:** 5.0.8
- **React Hook Form:** 7.53.1
- **Zod:** 3.23.8

### Backend Integration
- **NextAuth:** 4.24.10
- **Supabase:** 2.38.4
- **HLS.js:** 1.5.0

### Developer Tools
- **TypeScript:** 5.x
- **ESLint:** With jsx-a11y plugin
- **Prettier:** With Tailwind plugin

---

## 🚀 Getting Started

### Prerequisites

```bash
Node 22.x
Yarn 1.22.x
```

### Local Development

```bash
# 1. Clone repository
git clone https://github.com/executiveusa/strapi-template-new-world-kids.git
cd strapi-template-new-world-kids

# 2. Install dependencies
nvm use  # Switch to Node 22
yarn     # Install all workspace dependencies

# 3. Setup environment variables
cp .env.example .env.local
# Add STRAPI_REST_READONLY_API_KEY after starting Strapi

# 4. Start services
yarn dev:cms  # Start Strapi on :1337
yarn dev:web  # Start Next.js on :3000

# 5. Access
# - Web UI: http://localhost:3000
# - Strapi Admin: http://localhost:1337/admin
# - Cockpit: http://localhost:3000/cockpit
```

---

## 📝 Notes

### Monorepo Structure

This is a **Turborepo** monorepo with:
- **Apps:** Next.js web app, mobile app
- **Services:** Strapi CMS, Stellar Agents, Stream, Blockchain, etc.
- **Packages:** Shared design system, utilities, configs

### Build Strategy

- **Development:** Hot reload with Turbo watch mode
- **Production:** Turborepo parallel builds with caching
- **Deployment:**
  - Frontend → Vercel
  - Backend → Render
  - Database → Supabase

---

**Last Updated:** 2025-10-29
**Maintainer:** Claude Code
**Version:** 1.0.0
