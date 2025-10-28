# New World Kids Platform - Brownfield Enhancement PRD

**Version:** 1.0
**Date:** 2025-10-20
**Status:** Draft

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-10-20 | 1.0 | Initial brownfield PRD for unified platform | BMAD Analyst |

---

## 1. Intro Project Analysis and Context

### 1.1 Analysis Source

**Approach:** Combined analysis of two existing projects:
- **Project #1** (`C:\Users\Trevor\newworldkids`) - Vite + React 18 + Solana blockchain - **UI/UX Foundation**
- **Project #2** (`C:\Users\Trevor\strapi-template-new-world-kids`) - Next.js 14 + Strapi CMS monorepo - **Architecture Foundation**

### 1.2 Existing Project Overview

#### Current Project State - Project #1 (UI Foundation)

**Purpose:** Educational platform teaching children about Web3/blockchain while supporting wildlife conservation through donations.

**Tech Stack:**
- Frontend: React 18 + Vite + TypeScript 5
- Styling: Tailwind CSS 3.3 + shadcn/ui (50+ components)
- Blockchain: Solana Web3.js + Wallet Adapter (Phantom)
- Backend: Supabase
- State: TanStack React Query

**Current Features (Implemented):**
- ✅ Home page with hero, features, testimonials
- ✅ Navigation system (16 routes defined)
- ✅ Donation UI components (forms, progress tracking, tiers)
- ✅ AI Agents framework (4 agent types: NovaSign, EchoAgent, FlowAgent, PulseAgent)
- ✅ Exclusive perks system UI
- ✅ Leaderboard pages (companies and helpers)
- ✅ NFT badge progress tracking UI
- ✅ Blog page (static content)
- ✅ Wallet connection framework
- ✅ Beautiful gradient design with glass morphism effects

**Incomplete Features (Critical Gaps):**
- ❌ Dashboard - Empty stub ("Coming soon...")
- ❌ Impact Projects - Empty stub ("Coming soon...")
- ❌ Blockchain Tracker - Empty stub ("Coming soon...")
- ❌ AI Workforce - Empty stub ("Coming soon...")
- ❌ AI Agent Service - Returns mock responses only
- ❌ Donation processing - UI only, no payment backend
- ❌ NFT receipt generation - Placeholder images only
- ❌ 3D Animals viewer - Button exists but non-functional
- ❌ Wallet connection - Setup guide only, buttons non-functional
- ❌ Dynamic data loading from Supabase

**Project Maturity:** ~40-50% (Frontend mostly complete, backend/blockchain features missing)

#### Current Project State - Project #2 (Architecture Foundation)

**Purpose:** "Trail Mixx" - Complete monorepo for community-focused internet radio station with CMS, streaming, and mobile support.

**Tech Stack:**
- Frontend: Next.js 15 + React 18 + TypeScript
- Styling: TailwindCSS v4 + Shadcn/ui
- Backend: Strapi v5 CMS + PostgreSQL
- Services: Node.js/Express (HLS proxy + analytics)
- Mobile: Capacitor (iOS/Android)
- Monorepo: Turborepo + Yarn workspaces
- i18n: next-intl (English/Spanish)

**Architecture:**
```
trail-mixx/
├── apps/
│   ├── web/              # Next.js frontend
│   └── mobile/           # Capacitor wrapper
├── services/
│   ├── cms/              # Strapi CMS
│   └── stream/           # HLS proxy + analytics
├── packages/
│   └── player-sdk/       # Reusable components
└── configs/              # Configuration files
```

**Current Features (Implemented):**
- ✅ Complete monorepo structure
- ✅ Strapi v5 CMS (Promo, Merchant, Show, Track content types)
- ✅ HLS audio streaming with fallback
- ✅ Stream analytics (CSV logging)
- ✅ Bilingual support (EN/ES)
- ✅ Mobile apps (Capacitor)
- ✅ Player SDK component
- ✅ Agent system (auto-onboard, MixerAgent)
- ✅ WCAG 2.1 AA accessibility
- ✅ Docker configurations
- ✅ CI/CD workflows

**Outstanding Work:**
- ⚠️ Needs real HLS origin URL configuration
- ⚠️ Requires music licenses (SoundExchange, ASCAP, BMI, SESAC)
- ⚠️ Mobile apps not released to stores yet
- ⚠️ Limited E2E testing (Playwright planned)

**Project Maturity:** ~85% (Production-ready architecture, needs content migration and deployment)

### 1.3 Available Documentation Analysis

**Project #1 Documentation:**
- ✓ README.md (basic setup instructions)
- ✗ Architecture documentation (none)
- ✗ Tech Stack documentation (inferred from package.json)
- ✗ API documentation (none)
- ✗ Coding standards (none)
- ✗ Technical debt documentation (none)

**Project #2 Documentation:**
- ✓ README.md (comprehensive)
- ✓ PROJECT_SUMMARY.md (complete overview)
- ✓ DESIGN_AUDIT.md (design system)
- ✓ MIGRATION_NOTES.md (file mappings)
- ✓ CHANGELOG.md (v1.0.0 release notes)
- ✓ docs/compliance/ (legal requirements)
- ✓ docs/spec-kit/ (acceptance criteria)
- ✓ docs/BMAD-Playbooks/ (DailyOps, ContentGrowth)
- ✓ docs/tokens.md (design tokens)

### 1.4 Enhancement Scope Definition

#### Enhancement Type

- ✅ **Major Feature Modification** - Transforming Trail Mixx monorepo into New World Kids nonprofit platform
- ✅ **New Feature Addition** - Implementing blockchain donations, NFT receipts, AI agents
- ✅ **Integration with New Systems** - Adding Solana blockchain integration
- ✅ **UI/UX Overhaul** - Adopting Project #1's design language with tweakcn enhancements
- ✅ **Technology Stack Upgrade** - Maintaining Next.js 15 + adding Solana Web3

#### Enhancement Description

Transform the existing Trail Mixx monorepo architecture into the New World Kids nonprofit platform by:
1. Migrating Project #1's beautiful UI/UX design and donation features into Project #2's Next.js + Strapi monorepo
2. Implementing complete blockchain donation processing with Solana
3. Adding NFT receipt generation and minting
4. Building out the 4 incomplete pages (Dashboard, Impact Projects, Blockchain Tracker, AI Workforce)
5. Integrating real AI agent services (replacing mock responses)
6. Making Trail Mixx Radio a feature within the larger nonprofit site
7. Implementing tweakcn design system optimized for nonprofit donations
8. Adding comprehensive Strapi blog for nonprofit content management

#### Impact Assessment

- ✅ **Significant Impact** - Substantial existing code changes in Project #2
  - Rebrand from "Trail Mixx" to "New World Kids"
  - Convert radio-focused site to nonprofit platform
  - Radio becomes one feature among many
  - Major UI/UX redesign with Project #1's design system
  - Add new services for blockchain and AI agents

### 1.5 Goals and Background Context

#### Goals

1. **Unified Platform** - Combine best of both projects: Project #1's design + Project #2's architecture
2. **Complete Blockchain Integration** - Functional Solana donation processing with NFT receipts
3. **Production-Ready Nonprofit Site** - Highly structured, professional nonprofit platform
4. **Strapi Blog** - Content management for blog posts, impact stories, wildlife content
5. **Reduced Donor Friction** - Optimized donation UX based on nonprofit best practices
6. **Maximize Donations** - Design patterns proven to increase conversion rates
7. **Trail Mixx Integration** - Radio feature integrated naturally into larger platform
8. **AI-Powered Features** - Real AI agent integration (not mocks)
9. **Accessibility** - WCAG 2.1 AA compliant throughout
10. **Mobile Support** - Capacitor-based mobile apps for iOS and Android

#### Background Context

New World Kids aims to educate young people about Web3/blockchain technology while supporting wildlife conservation. The project currently exists as two separate codebases:

**Problem:**
- Project #1 has beautiful UI/UX but lacks proper backend architecture
- Project #2 has production-ready architecture but wrong content focus (radio vs nonprofit)
- Neither project is complete or production-ready on its own

**Solution:**
Merge the projects using BMAD-METHOD brownfield approach:
- Use Project #2's monorepo as the foundation (Next.js 15 + Strapi + Turborepo)
- Migrate Project #1's UI components, design system, and features
- Complete the incomplete features with proper implementation
- Add blockchain payment processing and NFT minting
- Transform radio-focused content to nonprofit-focused content
- Integrate Trail Mixx as one feature within the platform

**Why This Enhancement is Needed:**
- Proper separation of concerns (frontend apps vs backend services)
- Scalable architecture for growing nonprofit
- Production-ready CMS for content management
- Mobile app support for broader reach
- Professional development workflow (monorepo + BMAD agents)

---

## 2. Requirements

### 2.1 Functional Requirements

**FR1:** The platform shall migrate all UI components from Project #1 (Vite app) to Project #2's Next.js 15 framework while maintaining design fidelity.

**FR2:** The platform shall implement complete Solana blockchain donation processing, replacing the mock implementation in Project #1.

**FR3:** The platform shall generate and mint NFT receipts on Solana blockchain for donations above a configurable threshold.

**FR4:** The platform shall implement a Dashboard page displaying:
- Total donations received
- Active impact projects
- User's donation history
- NFT receipts owned
- Blockchain transaction history
- Personal impact metrics

**FR5:** The platform shall implement an Impact Projects page displaying:
- List of active conservation projects
- Funding progress for each project
- Geographic locations (interactive map)
- Wildlife species benefited
- Project updates from Strapi CMS

**FR6:** The platform shall implement a Blockchain Tracker page displaying:
- Real-time Solana blockchain transactions
- Donation transparency ledger
- Smart contract interactions
- Transaction verification tools

**FR7:** The platform shall implement an AI Workforce page displaying:
- AI agent ecosystem overview
- Agent capabilities and use cases
- Agent chat interfaces
- Agent performance metrics

**FR8:** The platform shall integrate real AI agent services (OpenAI, Anthropic, or similar) replacing the mock agent service in Project #1.

**FR9:** The platform shall add Strapi CMS content types for:
- Blog posts (with rich text editor)
- Impact stories
- Wildlife information
- Project updates
- Team members
- Testimonials

**FR10:** The platform shall implement Trail Mixx Radio as a feature accessible from:
- Dedicated `/radio` route
- "Listen Live" section on homepage
- Radio widget embeddable on any page

**FR11:** The platform shall migrate all 50+ shadcn/ui components from Project #1 to Next.js with tweakcn styling enhancements.

**FR12:** The platform shall implement donation flow optimization:
- One-click donation amounts
- Recurring donation options
- Impact preview before donation
- Social proof (recent donors)
- Progress bars showing goals
- Transparent fee breakdown

**FR13:** The platform shall implement wallet connection using Solana Wallet Adapter with support for:
- Phantom wallet
- Solflare wallet
- Ledger hardware wallet

**FR14:** The platform shall implement animated 3D animal viewer using Three.js or similar, replacing the placeholder button.

**FR15:** The platform shall maintain bilingual support (English/Spanish) from Project #2 and extend to all new pages.

**FR16:** The platform shall implement exclusive perks system with real-time status tracking:
- Donation threshold tracking
- Perk unlock notifications
- Digital badge distribution
- Physical reward fulfillment tracking

**FR17:** The platform shall implement leaderboard systems with:
- Real-time ranking updates
- Public/private profile options
- Company sponsorship leaderboard
- Individual donor leaderboard

**FR18:** The platform shall integrate Supabase for:
- User authentication
- Donation history storage
- Perk tracking
- Analytics data

**FR19:** The platform shall implement comprehensive mobile apps using Capacitor with:
- Native wallet integration
- Push notifications for impact updates
- Offline viewing of saved content
- Radio streaming

**FR20:** The platform shall implement admin dashboard in Strapi for:
- Content management
- Donation moderation
- User management
- Impact project tracking
- Analytics reporting

### 2.2 Non-Functional Requirements

**NFR1:** The platform shall achieve Core Web Vitals targets:
- LCP ≤ 2.5s (Largest Contentful Paint)
- FID ≤ 100ms (First Input Delay)
- CLS ≤ 0.1 (Cumulative Layout Shift)

**NFR2:** The platform shall maintain WCAG 2.1 AA accessibility compliance across all pages.

**NFR3:** The platform shall support responsive design for:
- Mobile devices (320px+)
- Tablets (768px+)
- Desktop (1024px+)
- Large screens (1920px+)

**NFR4:** The platform shall maintain existing Trail Mixx performance characteristics:
- Stream stall recovery ≤ 2s
- API response times ≤ 200ms (p95)
- Page load times ≤ 3s on 3G connection

**NFR5:** The platform shall implement security best practices:
- HTTPS only
- Content Security Policy (CSP)
- OWASP Top 10 protection
- Secure wallet connections (no private key exposure)

**NFR6:** The platform shall support internationalization (i18n) with:
- English (default)
- Spanish
- Extensible to additional languages

**NFR7:** The platform shall implement error handling and logging:
- Structured logging (JSON format)
- Error tracking (Sentry or similar)
- User-friendly error messages
- Graceful degradation

**NFR8:** The platform shall optimize for SEO:
- Server-side rendering (Next.js)
- Semantic HTML
- Open Graph meta tags
- Structured data (JSON-LD)
- Sitemap generation

**NFR9:** The platform shall implement monitoring and observability:
- Real-time performance monitoring
- Donation tracking analytics
- User behavior analytics
- Error rate monitoring

**NFR10:** The platform shall maintain code quality:
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Git commit conventions (Conventional Commits)

### 2.3 Compatibility Requirements

**CR1 - Existing Monorepo Structure:** New features must integrate with existing Turborepo workspace structure without breaking existing services (CMS, stream).

**CR2 - Strapi Content Types:** New content types must follow existing Strapi v5 patterns and conventions from Trail Mixx.

**CR3 - UI Component Library:** New components must use existing shadcn/ui + tweakcn patterns for consistency.

**CR4 - API Consistency:** New API endpoints must follow existing REST conventions and response formats from Trail Mixx services.

**CR5 - Database Schema:** New database tables must integrate with existing PostgreSQL schema without breaking existing Trail Mixx data.

**CR6 - Authentication:** New authentication must work with existing Strapi user management system.

**CR7 - Mobile Apps:** New features must be compatible with existing Capacitor mobile wrapper.

**CR8 - CI/CD Pipeline:** New features must pass existing GitHub Actions workflows and quality gates.

---

## 3. User Interface Enhancement Goals

### 3.1 Integration with Existing UI

The new New World Kids UI will replace Trail Mixx branding while maintaining the architectural foundation:

**Design System Migration:**
- Adopt tweakcn design system (https://github.com/jnsahaj/tweakcn) for modern, conversion-optimized styling
- Migrate Project #1's gradient designs and glass morphism effects
- Maintain shadcn/ui component patterns from Project #2
- Use TailwindCSS v4 configuration from Trail Mixx
- Implement design tokens optimized for nonprofit donation UX

**Key Design Principles:**
1. **Reduce Donor Friction** - Streamlined donation flows (3 clicks max)
2. **Build Trust** - Transparent blockchain tracking, clear impact metrics
3. **Social Proof** - Prominent display of recent donors, testimonials
4. **Urgency Without Pressure** - Progress bars, matching campaigns, no dark patterns
5. **Visual Hierarchy** - Clear CTAs, scannable content, generous whitespace
6. **Emotional Connection** - Beautiful wildlife imagery, compelling impact stories

**Design Patterns for Donation Optimization:**
- ✅ Default donation amounts with strategic anchoring
- ✅ Suggested amounts based on average donor behavior
- ✅ Progress bars showing goal proximity (proven to increase donations)
- ✅ Social proof widgets ("23 people donated in the last hour")
- ✅ Impact preview ("Your $50 donation will feed 5 elephants for a week")
- ✅ Transparent fee breakdown (builds trust)
- ✅ Recurring donation opt-in (not opt-out)
- ✅ One-click donation for returning donors
- ✅ Mobile-first design (60%+ of donations on mobile)
- ✅ Exit-intent modal with compelling ask

### 3.2 Modified/New Screens and Views

**New Pages (from Project #1 stubs → Full implementation):**
1. `/dashboard` - User dashboard with donation history, NFTs, impact metrics
2. `/impact-projects` - Interactive map + project cards with funding progress
3. `/blockchain-tracker` - Real-time blockchain transaction explorer
4. `/ai-workforce` - AI agent ecosystem hub with chat interfaces

**Modified Pages:**
1. `/` (Home) - Hero with compelling mission statement, featured projects, live donation ticker, radio widget
2. `/donate` - Complete implementation with blockchain processing
3. `/blog` - Connected to Strapi CMS with rich content
4. `/radio` - Trail Mixx radio feature (migrated from Project #2's `/listen`)
5. `/nft-receipt` - Real NFT display (not placeholder)
6. `/wallet-setup` - Functional wallet connection (not just guide)
7. `/animated-3d-animals` - Working 3D viewer with Three.js

**Preserved Pages (from Project #1):**
1. `/leaderboard-companies` - Company sponsors
2. `/leaderboard-helpers` - Individual donors
3. `/special-nft-badges` - NFT badge collection
4. `/exclusive-perks` - Donor perks system
5. `/agents` - AI agent hub

**New Admin Pages (Strapi CMS):**
1. `/admin/blog-posts` - Blog post management
2. `/admin/impact-projects` - Project management
3. `/admin/donations` - Donation monitoring
4. `/admin/users` - User management
5. `/admin/wildlife` - Wildlife database

### 3.3 UI Consistency Requirements

**Typography:**
- Headings: Inter (from tweakcn defaults)
- Body: System font stack for optimal performance
- Code/Mono: JetBrains Mono (for wallet addresses, transaction IDs)

**Color Palette (Optimized for Donations):**
- Primary: Warm gradient (trust + energy) - `#10b981` to `#3b82f6`
- Success: Green for completed donations - `#10b981`
- Warning: Amber for pending transactions - `#f59e0b`
- Error: Red for failed transactions - `#ef4444`
- Neutral: Slate for backgrounds - `#1e293b`, `#334155`, etc.
- Wildlife accent colors: Earthy tones for project cards

**Component Patterns:**
- Buttons: Rounded, gradient hover states, clear loading indicators
- Cards: Glass morphism effect with subtle borders
- Forms: Large touch targets (min 44px), inline validation
- Modals: Backdrop blur, smooth animations
- Toast notifications: Corner placement, auto-dismiss

**Animation Guidelines:**
- Subtle motion (respect prefers-reduced-motion)
- Loading states for all async actions
- Smooth page transitions (Next.js + Framer Motion)
- Scroll-triggered animations for impact sections

**Responsive Breakpoints:**
```
sm: 640px   (Mobile landscape)
md: 768px   (Tablet)
lg: 1024px  (Desktop)
xl: 1280px  (Large desktop)
2xl: 1536px (Extra large)
```

---

## 4. Technical Constraints and Integration Requirements

### 4.1 Existing Technology Stack

**From Project #2 (Trail Mixx) - MAINTAIN:**

| Category | Technology | Version | Usage in Enhancement | Notes |
|----------|-----------|---------|---------------------|-------|
| **Framework** | Next.js | 15.x | Primary frontend framework | Keep existing |
| **Runtime** | Node.js | 20+ | Backend services | Keep existing |
| **Language** | TypeScript | 5.x | All code | Keep existing |
| **Styling** | TailwindCSS | 4.x | All styling | Keep existing |
| **UI Library** | Shadcn/ui | Latest | Component foundation | Enhance with tweakcn |
| **CMS** | Strapi | 5.x | Content management | Add new content types |
| **Database** | PostgreSQL | 13+ | Primary data store | Add new tables |
| **Monorepo** | Turborepo | Latest | Build orchestration | Keep existing |
| **Package Manager** | Yarn | 1.x | Dependency management | Keep existing |
| **Mobile** | Capacitor | 5.x | Native wrapper | Keep existing |
| **i18n** | next-intl | 3.11+ | Internationalization | Extend to new pages |
| **Animation** | Framer Motion | 11.x | UI animations | Keep existing |

**From Project #1 (newworldkids) - MIGRATE TO PROJECT #2:**

| Category | Technology | Version | Migration Strategy | Notes |
|----------|-----------|---------|-------------------|-------|
| **Blockchain** | Solana Web3.js | Latest | Add to Next.js | New dependency |
| **Wallet Adapter** | @solana/wallet-adapter-* | Latest | Add to Next.js | New dependency |
| **State Management** | TanStack Query | Latest | Already in Project #2 | Keep existing |
| **Backend** | Supabase | Latest | Add alongside Strapi | Authentication + real-time |
| **Design System** | shadcn/ui | Latest | Already in Project #2 | Migrate components |

**NEW ADDITIONS:**

| Technology | Version | Purpose | Rationale |
|-----------|---------|---------|-----------|
| tweakcn | Latest | Enhanced design system | Optimal nonprofit donation UX |
| Three.js / React Three Fiber | Latest | 3D animal viewer | Visual engagement |
| OpenAI SDK / Anthropic SDK | Latest | Real AI agents | Replace mock service |
| @solana/spl-token | Latest | NFT minting | Token creation |
| Metaplex SDK | Latest | NFT metadata | NFT standard compliance |

### 4.2 Integration Approach

**Database Integration Strategy:**
- **Primary Database:** PostgreSQL (existing from Trail Mixx)
- **New Tables:**
  - `donations` - Blockchain donation records
  - `nft_receipts` - Minted NFT metadata
  - `impact_projects` - Conservation projects
  - `user_perks` - Perk tracking
  - `blockchain_transactions` - Transaction history
- **Strapi Integration:** Use Strapi's ORM (Knex.js) for all CMS-related content
- **Supabase Integration:** Real-time subscriptions for donation updates, authentication

**API Integration Strategy:**
- **REST APIs:** Maintain existing Strapi REST patterns for CMS content
- **GraphQL:** Optional future enhancement (Strapi supports GraphQL)
- **Blockchain APIs:**
  - Solana RPC endpoints (Helius or QuickNode for production)
  - On-chain program calls for NFT minting
- **AI APIs:**
  - OpenAI API for NovaSign agent (conversational)
  - Anthropic Claude for complex reasoning
  - Agent service layer in `services/ai-agents/`

**Frontend Integration Strategy:**
- **App Router:** Use Next.js 15 App Router (existing in Project #2)
- **Server Components:** Leverage RSC for optimal performance
- **Client Components:** Only for interactive features (wallet, donations)
- **Component Migration:**
  - Copy Project #1's `src/components/` to `apps/web/src/components/`
  - Refactor React Router to Next.js routing
  - Convert Vite imports to Next.js imports
- **Styling Migration:**
  - Copy Tailwind config from Project #1
  - Merge with Project #2's TailwindCSS v4 config
  - Apply tweakcn enhancements

**Testing Integration Strategy:**
- **Unit Tests:** Jest (existing in Project #2)
- **E2E Tests:** Playwright (planned in Project #2)
- **Blockchain Tests:**
  - Solana test validator for local testing
  - Devnet for integration testing
  - Mainnet for production
- **Contract Tests:** Pact for API contract testing

### 4.3 Code Organization and Standards

**File Structure Approach:**
```
strapi-template-new-world-kids/
├── apps/
│   ├── web/                          # Next.js 15 frontend
│   │   ├── src/
│   │   │   ├── app/                  # App Router pages
│   │   │   │   ├── (marketing)/     # Public pages
│   │   │   │   │   ├── page.tsx     # Home
│   │   │   │   │   ├── donate/
│   │   │   │   │   ├── blog/
│   │   │   │   │   └── radio/       # Trail Mixx feature
│   │   │   │   ├── (platform)/      # Authenticated pages
│   │   │   │   │   ├── dashboard/
│   │   │   │   │   ├── impact-projects/
│   │   │   │   │   ├── blockchain-tracker/
│   │   │   │   │   └── ai-workforce/
│   │   │   │   └── api/             # API routes
│   │   │   ├── components/          # React components (from Project #1)
│   │   │   │   ├── ui/              # shadcn/ui + tweakcn
│   │   │   │   ├── home/            # Home page sections
│   │   │   │   ├── donation/        # Donation flow
│   │   │   │   └── blockchain/      # Web3 components
│   │   │   ├── lib/                 # Utilities
│   │   │   │   ├── blockchain/      # Solana utilities
│   │   │   │   ├── supabase/        # Supabase client
│   │   │   │   └── strapi/          # Strapi client
│   │   │   └── hooks/               # Custom React hooks
│   │   └── public/                  # Static assets
│   └── mobile/                       # Capacitor wrapper
├── services/
│   ├── cms/                          # Strapi CMS
│   │   ├── src/
│   │   │   ├── api/                 # Content types
│   │   │   │   ├── blog-post/
│   │   │   │   ├── impact-project/
│   │   │   │   ├── wildlife/
│   │   │   │   └── [trail-mixx content types]
│   │   │   └── extensions/
│   │   └── database/
│   ├── stream/                       # HLS proxy (Trail Mixx)
│   ├── blockchain/                   # NEW: Blockchain service
│   │   ├── src/
│   │   │   ├── donation-processor.ts
│   │   │   ├── nft-minter.ts
│   │   │   ├── transaction-tracker.ts
│   │   │   └── wallet-manager.ts
│   │   └── programs/                # Solana programs (if custom)
│   └── ai-agents/                    # NEW: AI agent service
│       ├── src/
│       │   ├── agents/
│       │   │   ├── nova-sign.ts
│       │   │   ├── echo-agent.ts
│       │   │   ├── flow-agent.ts
│       │   │   └── pulse-agent.ts
│       │   └── agent-service.ts
├── packages/
│   ├── player-sdk/                   # Trail Mixx player
│   ├── design-system/                # Shared design tokens
│   └── blockchain-sdk/               # NEW: Shared blockchain utilities
└── docs/
    ├── brownfield-prd.md            # This document
    ├── brownfield-architecture.md   # Architecture doc
    └── [existing Trail Mixx docs]
```

**Naming Conventions:**
- **Components:** PascalCase (`DonationForm.tsx`)
- **Utilities:** camelCase (`formatWalletAddress.ts`)
- **Constants:** UPPER_SNAKE_CASE (`SOLANA_NETWORK`)
- **Types:** PascalCase with `Type` suffix (`DonationFormType`)
- **Interfaces:** PascalCase with `I` prefix (`IDonation`)
- **API Routes:** kebab-case (`/api/process-donation`)

**Coding Standards:**
- **TypeScript:** Strict mode enabled
- **ESLint:** Extend from existing Trail Mixx config
- **Prettier:** 2-space indentation, single quotes
- **Imports:** Absolute imports using `@/` alias
- **Comments:** JSDoc for public APIs, inline comments for complex logic
- **Error Handling:** Try-catch with structured error objects
- **Logging:** Structured JSON logs using Winston or Pino

**Documentation Standards:**
- **README.md:** In every package/service
- **API Docs:** OpenAPI/Swagger for REST endpoints
- **Component Docs:** Storybook for UI components (future)
- **Architecture Decisions:** ADRs in `docs/decisions/`

### 4.4 Deployment and Operations

**Build Process Integration:**
- **Turborepo:** Existing build orchestration (keep)
- **Build Commands:**
  ```bash
  yarn build               # Build all apps and services
  yarn build:web          # Build Next.js app only
  yarn build:cms          # Build Strapi CMS only
  yarn build:blockchain   # Build blockchain service
  yarn build:ai-agents    # Build AI agent service
  ```
- **Docker:** Existing Dockerfiles (update for new services)

**Deployment Strategy:**
- **Web App:** Vercel (existing Trail Mixx deployment)
- **Strapi CMS:** Render or Railway (existing)
- **PostgreSQL:** Render managed database (existing)
- **Blockchain Service:** Railway or Fly.io (NEW)
- **AI Agent Service:** Railway or Fly.io (NEW)
- **Static Assets:** Vercel CDN (existing)

**Environment Variables:**
```env
# Existing (Trail Mixx)
DATABASE_URL=
STRAPI_ADMIN_JWT_SECRET=
NEXT_PUBLIC_STRAPI_URL=

# New (Blockchain)
SOLANA_RPC_URL=
SOLANA_NETWORK=mainnet-beta
NFT_MINTING_WALLET_PRIVATE_KEY=
METAPLEX_PROGRAM_ID=

# New (AI Agents)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# New (Supabase)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

**Monitoring and Logging:**
- **Performance:** Vercel Analytics (existing)
- **Errors:** Sentry (add)
- **Logs:** Structured JSON logs to stdout (capture in Render/Vercel)
- **Blockchain:** Custom dashboard tracking transaction success rates
- **Donations:** Real-time analytics in Strapi admin

**Configuration Management:**
- **Environment-based:** `.env.development`, `.env.production`
- **Secrets:** Stored in Vercel/Render secret management
- **Feature Flags:** Environment variables for gradual rollout

### 4.5 Risk Assessment and Mitigation

**Technical Risks:**

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Blockchain transaction failures | High | Medium | Implement retry logic, fallback to email receipts |
| NFT minting failures | Medium | Medium | Queue-based processing, manual retry dashboard |
| AI API rate limits | Medium | High | Implement caching, rate limiting, fallback responses |
| Migration breaks Trail Mixx | High | Low | Feature flags, gradual rollout, comprehensive testing |
| Wallet connection issues | High | Medium | Support multiple wallets, clear error messages |
| Payment processing delays | High | Low | Real-time status updates, webhook notifications |

**Integration Risks:**

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Strapi content type conflicts | Medium | Low | Namespace new content types (`nwk_*` prefix) |
| Database migration failures | High | Low | Backup before migration, rollback scripts |
| Supabase + Strapi auth conflict | Medium | Medium | Use Supabase for frontend auth, Strapi for CMS only |
| Next.js version compatibility | Low | Low | Existing Project #2 already on Next.js 15 |

**Deployment Risks:**

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Vercel deployment failures | Medium | Low | Pre-deployment checks, preview deployments |
| Database connection limits | Medium | Medium | Connection pooling (PgBouncer) |
| API rate limiting | Medium | High | Implement caching, CDN for static content |
| Mobile app store rejection | Medium | Medium | Follow guidelines, beta testing, phased rollout |

**Mitigation Strategies:**

1. **Blockchain Transaction Reliability:**
   - Use Helius or QuickNode RPC (99.9% uptime)
   - Implement transaction confirmation polling
   - Store pending transactions in database
   - Retry failed transactions automatically
   - Provide manual retry in admin dashboard

2. **NFT Minting Reliability:**
   - Use Metaplex SDK (battle-tested)
   - Queue-based processing (BullMQ)
   - Store NFT metadata in IPFS + Arweave (redundancy)
   - Fallback to email certificates if minting fails

3. **AI Service Reliability:**
   - Cache common responses (Redis)
   - Implement rate limiting per user
   - Fallback to simpler responses if API fails
   - Monitor API usage to avoid overage charges

4. **Migration Safety:**
   - Feature flags for gradual rollout
   - Comprehensive E2E tests before deployment
   - Database backups before migration
   - Rollback plan documented

5. **Performance Under Load:**
   - CDN for static assets
   - Database query optimization
   - Implement pagination for large datasets
   - Load testing before launch

---

## 5. Epic and Story Structure

### 5.1 Epic Approach

**Epic Structure Decision:** Multiple coordinated epics with clear dependencies

**Rationale:**
This brownfield enhancement involves multiple distinct areas of work:
1. Infrastructure and architecture setup
2. UI/UX migration from Project #1
3. Blockchain integration
4. AI agent implementation
5. Content management (Strapi)
6. Feature completion (4 empty pages)

Each epic can be worked on by different team members or BMAD agents in parallel, with clear dependencies managed through the epic structure.

**Epic Sequencing Strategy:**
- **Phase 1: Foundation** (Epics 1-2) - Setup infrastructure, migrate UI
- **Phase 2: Core Features** (Epics 3-5) - Blockchain, AI, content
- **Phase 3: Completion** (Epics 6-7) - Feature pages, polish

---

## 6. Epic Details

### Epic 1: Project Foundation and Architecture Setup

**Epic Goal:** Establish the unified project foundation by setting up the monorepo structure, migrating design system, and configuring all required services.

**Integration Requirements:**
- Maintain existing Trail Mixx monorepo structure
- Add new services (blockchain, ai-agents) without breaking existing ones
- Configure all environment variables and secrets
- Set up development environment for team

**Stories:**

#### Story 1.1: Monorepo Structure Setup

As a **developer**,
I want **the monorepo configured with new services and packages**,
so that **we have a clean foundation for building New World Kids features**.

**Acceptance Criteria:**
1. `services/blockchain/` created with basic Express server structure
2. `services/ai-agents/` created with basic Express server structure
3. `packages/blockchain-sdk/` created for shared blockchain utilities
4. Turborepo config updated to include new services
5. Package.json scripts added for new services (`dev:blockchain`, `dev:ai-agents`)
6. TypeScript configs set up for new services
7. ESLint and Prettier configs applied to new services
8. Docker configs created for new services
9. All services start successfully with `yarn dev`
10. CI/CD workflows updated to build new services

**Integration Verification:**
- IV1: Existing services (cms, stream) still run without errors
- IV2: `yarn build` successfully builds all services including new ones
- IV3: No breaking changes to existing Trail Mixx functionality

---

#### Story 1.2: Design System Migration (tweakcn + Project #1 styles)

As a **frontend developer**,
I want **the design system migrated from Project #1 with tweakcn enhancements**,
so that **we have a consistent, conversion-optimized UI foundation**.

**Acceptance Criteria:**
1. tweakcn installed and configured in `apps/web/`
2. Tailwind config merged from Project #1 and Project #2
3. Custom colors defined for New World Kids brand
4. Typography system configured (Inter + system fonts)
5. shadcn/ui components from Project #1 copied to `apps/web/src/components/ui/`
6. Glass morphism effect utilities added to Tailwind config
7. Gradient utilities configured
8. Animation presets configured (Framer Motion)
9. Responsive breakpoints verified
10. Storybook configured for component documentation (optional)

**Integration Verification:**
- IV1: Existing Trail Mixx components still render correctly
- IV2: TailwindCSS v4 features still work (no regressions)
- IV3: Build process completes without CSS conflicts

---

#### Story 1.3: Environment Configuration and Secrets Management

As a **DevOps engineer**,
I want **all environment variables and secrets configured across environments**,
so that **services can communicate securely in dev, staging, and production**.

**Acceptance Criteria:**
1. `.env.example` updated with all required variables (blockchain, AI, Supabase)
2. Development environment variables set up locally
3. Vercel environment variables configured for Next.js app
4. Render environment variables configured for Strapi and services
5. Solana RPC endpoints configured (testnet for dev, mainnet for prod)
6. AI API keys configured (OpenAI, Anthropic)
7. Supabase project created and connection strings configured
8. Database connection strings configured
9. JWT secrets rotated and stored securely
10. Documentation updated with setup instructions

**Integration Verification:**
- IV1: All services connect to databases successfully
- IV2: API keys work without rate limit errors in dev
- IV3: No secrets committed to git (pre-commit hook)

---

### Epic 2: UI/UX Migration and Rebranding

**Epic Goal:** Migrate all UI components from Project #1 (Vite) to Project #2 (Next.js), rebrand from Trail Mixx to New World Kids, and implement optimal donation UX patterns.

**Integration Requirements:**
- Maintain existing Trail Mixx pages during migration (feature flags)
- Ensure no breaking changes to existing components
- Keep mobile app compatibility
- Maintain accessibility standards

**Stories:**

#### Story 2.1: React Router to Next.js App Router Migration

As a **frontend developer**,
I want **all routes migrated from React Router to Next.js App Router**,
so that **we have proper SSR, SEO, and routing in Next.js**.

**Acceptance Criteria:**
1. Route structure mapped: React Router → Next.js App Router
2. Home page (`/`) migrated from Project #1
3. Marketing pages grouped under `(marketing)` route group
4. Platform pages grouped under `(platform)` route group
5. Layouts created for each route group
6. Loading states implemented for each page
7. Error boundaries implemented
8. Metadata (SEO) configured for each page
9. Redirects configured for old Trail Mixx routes
10. Navigation tested across all routes

**Integration Verification:**
- IV1: All pages accessible and render correctly
- IV2: SEO metadata present in page source
- IV3: No 404 errors for existing routes

---

#### Story 2.2: Component Migration (Home, Navigation, Footer)

As a **frontend developer**,
I want **core layout components migrated from Project #1**,
so that **the site has proper navigation and branding**.

**Acceptance Criteria:**
1. Navbar component migrated with New World Kids branding
2. Footer component migrated with nonprofit info
3. Hero component migrated with compelling mission statement
4. Features component migrated
5. Testimonials component migrated
6. Download/CTA component migrated
7. All components use Next.js Image for optimization
8. All components are server components where possible
9. Wallet connection button integrated into navbar
10. Mobile menu functionality verified

**Integration Verification:**
- IV1: Navigation links work correctly
- IV2: Images load with proper optimization
- IV3: Mobile responsive layout works

---

#### Story 2.3: Donation Flow Components Migration

As a **frontend developer**,
I want **all donation-related components migrated and optimized**,
so that **users have a frictionless donation experience**.

**Acceptance Criteria:**
1. DonationForm component migrated
2. DonationProgress component migrated
3. DonationTiers component migrated
4. DonorBenefits component migrated
5. RecentDonors component migrated (social proof)
6. ImpactPreview component created (new)
7. One-click donation amounts implemented
8. Recurring donation toggle implemented
9. Impact calculator implemented ("Your $50 will...")
10. Mobile-optimized form inputs (large touch targets)

**Integration Verification:**
- IV1: Form validation works correctly
- IV2: Mobile UX is optimal (tested on real devices)
- IV3: Loading states prevent double submission

---

### Epic 3: Blockchain Integration (Solana Donations + NFT Receipts)

**Epic Goal:** Implement complete Solana blockchain integration for donation processing and NFT receipt generation, replacing mock implementations.

**Integration Requirements:**
- Use existing Supabase for storing blockchain transaction metadata
- Integrate with existing user authentication
- Provide admin dashboard in Strapi for monitoring
- Maintain security best practices (no private key exposure)

**Stories:**

#### Story 3.1: Solana Wallet Connection

As a **donor**,
I want **to connect my Solana wallet to the platform**,
so that **I can make blockchain donations**.

**Acceptance Criteria:**
1. Solana Wallet Adapter integrated into Next.js
2. Phantom wallet support implemented
3. Solflare wallet support implemented
4. Wallet connection button in navbar
5. Wallet disconnection functionality
6. Wallet address display (truncated)
7. Auto-reconnect on page refresh
8. Error handling for wallet connection failures
9. Mobile wallet connection tested (Phantom mobile)
10. Wallet connection state persisted

**Integration Verification:**
- IV1: Wallet connects without errors
- IV2: User state persists across page navigations
- IV3: No private keys exposed in client code

---

#### Story 3.2: Donation Processing Service

As a **donor**,
I want **my donation processed on Solana blockchain**,
so that **my contribution is transparent and verifiable**.

**Acceptance Criteria:**
1. Blockchain service (`services/blockchain/`) implements donation endpoint
2. SOL and USDC donation support implemented
3. Transaction signing and submission implemented
4. Transaction confirmation polling implemented
5. Transaction retry logic for failures
6. Database record created for each donation
7. Webhook notification sent on confirmation
8. Error handling for insufficient funds
9. Error handling for rejected transactions
10. Admin dashboard shows pending/confirmed donations

**Integration Verification:**
- IV1: Donations appear in Strapi admin dashboard
- IV2: Supabase stores transaction metadata correctly
- IV3: Failed transactions don't result in duplicate charges

---

#### Story 3.3: NFT Receipt Minting

As a **donor**,
I want **to receive an NFT receipt for my donation above $50**,
so that **I have a permanent, verifiable record on blockchain**.

**Acceptance Criteria:**
1. Metaplex SDK integrated
2. NFT metadata template created (JSON)
3. Donation amount and details encoded in metadata
4. IPFS upload for NFT images (Pinata or NFT.storage)
5. NFT minting function implemented
6. Minting triggered automatically for donations ≥$50
7. NFT sent to donor's wallet address
8. NFT metadata stored in database
9. NFT receipt page displays actual NFT (not placeholder)
10. Error handling for minting failures (queue retry)

**Integration Verification:**
- IV1: NFT appears in donor's wallet (Phantom, Magic Eden)
- IV2: NFT metadata is correct and displays properly
- IV3: Failed mints are queued for retry

---

### Epic 4: AI Agent Integration (Real Implementation)

**Epic Goal:** Replace mock AI agent service with real integrations to OpenAI and Anthropic APIs, providing functional conversational agents.

**Integration Requirements:**
- Maintain existing agent types from Project #1
- Integrate with Supabase for storing chat history
- Implement rate limiting per user
- Provide admin controls for agent behavior

**Stories:**

#### Story 4.1: AI Agent Service Infrastructure

As a **platform administrator**,
I want **a scalable AI agent service**,
so that **we can provide conversational AI features to users**.

**Acceptance Criteria:**
1. AI agent service (`services/ai-agents/`) created
2. OpenAI SDK integrated
3. Anthropic SDK integrated
4. Agent router endpoint created (`/api/agents/:agentType/chat`)
5. Chat history stored in Supabase
6. Rate limiting implemented (10 messages/hour per user)
7. Error handling for API failures
8. Response caching for common queries (Redis)
9. Admin dashboard for monitoring usage
10. Cost tracking for API calls

**Integration Verification:**
- IV1: API responds within 2 seconds (p95)
- IV2: Rate limiting prevents abuse
- IV3: Costs stay within budget ($500/month)

---

#### Story 4.2: Agent Implementations (NovaSign, EchoAgent, FlowAgent, PulseAgent)

As a **user**,
I want **to chat with specialized AI agents**,
so that **I can learn about Web3, conservation, and get personalized guidance**.

**Acceptance Criteria:**
1. NovaSign agent (Web3 educator) implemented with OpenAI GPT-4
2. EchoAgent (Conservation expert) implemented with Claude
3. FlowAgent (Donation advisor) implemented with GPT-4
4. PulseAgent (Impact tracker) implemented with Claude
5. Each agent has unique system prompt
6. Each agent references relevant context (projects, donations)
7. Agent responses are conversational and helpful
8. Agents cite sources for factual claims
9. Agents handle off-topic queries gracefully
10. Agent chat UI updated to show real responses (not mocks)

**Integration Verification:**
- IV1: Agent responses are contextually relevant
- IV2: No hallucinations about fake projects or data
- IV3: Chat history persists across sessions

---

### Epic 5: Strapi CMS Content Management

**Epic Goal:** Configure Strapi CMS with all required content types for New World Kids nonprofit content, blog, and impact projects.

**Integration Requirements:**
- Maintain existing Trail Mixx content types (for radio feature)
- Add new content types without breaking existing ones
- Configure permissions for admin and editors
- Set up i18n for English and Spanish

**Stories:**

#### Story 5.1: New Content Types (Blog, Impact Projects, Wildlife)

As a **content manager**,
I want **content types for blog posts, impact projects, and wildlife**,
so that **I can manage nonprofit content through Strapi**.

**Acceptance Criteria:**
1. `blog-post` content type created with fields:
   - title, slug, content (rich text), author, publishedAt, featuredImage, tags
2. `impact-project` content type created with fields:
   - name, description, location (lat/long), species, fundingGoal, currentFunding, status, images
3. `wildlife` content type created with fields:
   - species, scientificName, description, conservationStatus, habitat, threats, images
4. `team-member` content type created
5. `testimonial` content type created
6. All content types have i18n enabled (EN/ES)
7. API endpoints auto-generated (`/api/blog-posts`, `/api/impact-projects`, etc.)
8. Permissions configured (public read, admin write)
9. Seed data created for testing
10. API documentation generated

**Integration Verification:**
- IV1: Existing Trail Mixx content types still work
- IV2: API endpoints return correct data
- IV3: i18n switching works correctly

---

#### Story 5.2: Blog Frontend Integration

As a **reader**,
I want **to read blog posts on the New World Kids site**,
so that **I can stay informed about conservation efforts**.

**Acceptance Criteria:**
1. `/blog` page displays list of published posts
2. `/blog/[slug]` page displays individual post
3. Posts fetched from Strapi API
4. Rich text content rendered correctly
5. Featured images displayed
6. Author and publish date shown
7. Tags and categories filterable
8. Pagination implemented (10 posts per page)
9. SEO metadata for each post
10. Social share buttons

**Integration Verification:**
- IV1: Blog posts load within 2 seconds
- IV2: Images are optimized (Next.js Image)
- IV3: No broken links or missing content

---

### Epic 6: Feature Completion (4 Empty Pages)

**Epic Goal:** Build out the 4 incomplete pages (Dashboard, Impact Projects, Blockchain Tracker, AI Workforce) with full functionality.

**Integration Requirements:**
- Use existing authentication system
- Fetch data from Strapi, Supabase, and blockchain service
- Maintain consistent design with rest of site
- Ensure mobile responsiveness

**Stories:**

#### Story 6.1: Dashboard Page Implementation

As a **registered user**,
I want **a personal dashboard showing my donations and impact**,
so that **I can track my contributions**.

**Acceptance Criteria:**
1. Dashboard page accessible at `/dashboard`
2. Requires authentication (redirect to login if not authenticated)
3. Displays total donations (USD and SOL)
4. Displays donation history table with dates, amounts, projects
5. Displays NFT receipts owned (with images)
6. Displays impact metrics ("You've helped feed 42 elephants")
7. Displays active perks and progress
8. Displays upcoming exclusive events
9. Data fetched from Supabase and blockchain service
10. Mobile responsive layout

**Integration Verification:**
- IV1: Data loads within 2 seconds
- IV2: Real-time updates when new donation made
- IV3: Privacy controls work (hide/show public profile)

---

#### Story 6.2: Impact Projects Page Implementation

As a **visitor**,
I want **to explore conservation projects I can support**,
so that **I can choose where to direct my donations**.

**Acceptance Criteria:**
1. Impact Projects page accessible at `/impact-projects`
2. Displays interactive map with project locations (Mapbox or Leaflet)
3. Displays project cards with images, descriptions, funding progress
4. Filterable by species, location, funding status
5. Sortable by urgency, funding needed, popularity
6. Clicking project opens detail modal/page
7. Project detail shows full description, team, updates
8. "Donate to this project" CTA button
9. Data fetched from Strapi CMS
10. Mobile responsive grid layout

**Integration Verification:**
- IV1: Map markers are accurate and clickable
- IV2: Project images load optimally
- IV3: Filtering doesn't cause layout shift

---

#### Story 6.3: Blockchain Tracker Page Implementation

As a **donor or transparency advocate**,
I want **to view all blockchain transactions in real-time**,
so that **I can verify the platform's transparency**.

**Acceptance Criteria:**
1. Blockchain Tracker page accessible at `/blockchain-tracker`
2. Displays real-time transaction feed (WebSocket or polling)
3. Displays transaction details: hash, amount, donor (anonymous), project, timestamp
4. Filterable by date range, amount, project
5. Searchable by transaction hash or wallet address
6. Link to Solana explorer for each transaction
7. Chart showing donations over time
8. Total donations counter
9. Data fetched from blockchain service
10. Auto-refresh every 30 seconds

**Integration Verification:**
- IV1: Real transactions appear within 60 seconds
- IV2: Transaction links open correct explorer page
- IV3: No sensitive data (full wallet addresses) exposed

---

#### Story 6.4: AI Workforce Page Implementation

As a **curious user**,
I want **to learn about and interact with AI agents**,
so that **I can get personalized guidance and information**.

**Acceptance Criteria:**
1. AI Workforce page accessible at `/ai-workforce`
2. Displays 4 agent cards (NovaSign, EchoAgent, FlowAgent, PulseAgent)
3. Each card shows agent avatar, description, capabilities
4. Clicking agent opens chat interface
5. Chat interface shows conversation history
6. Chat interface allows sending messages
7. Real-time streaming responses (not mocks)
8. Agent performance metrics displayed (response time, satisfaction rating)
9. Rate limiting message shown when limit reached
10. Mobile responsive chat UI

**Integration Verification:**
- IV1: Chat responses are contextually relevant
- IV2: Chat history persists across sessions
- IV3: Rate limiting prevents abuse

---

### Epic 7: Testing, Optimization, and Launch Preparation

**Epic Goal:** Comprehensive testing, performance optimization, and production readiness checks before launch.

**Integration Requirements:**
- All features must pass E2E tests
- Performance must meet Core Web Vitals targets
- Security audit must be completed
- Legal compliance verified

**Stories:**

#### Story 7.1: E2E Testing with Playwright

As a **QA engineer**,
I want **comprehensive E2E tests for all critical user flows**,
so that **we can confidently deploy to production**.

**Acceptance Criteria:**
1. Playwright tests written for donation flow
2. Playwright tests written for wallet connection
3. Playwright tests written for blog reading
4. Playwright tests written for agent chat
5. Playwright tests written for dashboard
6. Tests run in CI/CD on every PR
7. Tests cover mobile and desktop viewports
8. Tests verify accessibility (axe-core)
9. Visual regression tests configured
10. Test coverage report generated

**Integration Verification:**
- IV1: All tests pass on clean database
- IV2: Tests are stable (no flaky tests)
- IV3: Test suite completes in <10 minutes

---

#### Story 7.2: Performance Optimization

As a **user**,
I want **the site to load quickly on slow connections**,
so that **I have a smooth experience**.

**Acceptance Criteria:**
1. Lighthouse scores ≥90 for all pages
2. Core Web Vitals meet targets (LCP ≤2.5s, FID ≤100ms, CLS ≤0.1)
3. Images optimized (WebP format, lazy loading)
4. Code splitting implemented
5. Bundle size analyzed and minimized
6. API responses cached appropriately
7. CDN configured for static assets
8. Database queries optimized (no N+1)
9. Monitoring configured (Vercel Analytics, Sentry)
10. Load testing performed (1000 concurrent users)

**Integration Verification:**
- IV1: PageSpeed Insights shows green scores
- IV2: Real User Monitoring shows <3s load times
- IV3: No memory leaks detected

---

#### Story 7.3: Security Audit and Compliance

As a **platform owner**,
I want **the platform to be secure and compliant**,
so that **donors can trust us with their funds and data**.

**Acceptance Criteria:**
1. OWASP Top 10 vulnerabilities checked (Semgrep or similar)
2. Dependency vulnerabilities scanned (npm audit, Snyk)
3. Wallet security reviewed (no private key exposure)
4. API endpoints secured with rate limiting
5. HTTPS enforced everywhere
6. Content Security Policy (CSP) configured
7. Privacy policy and terms of service drafted
8. GDPR compliance reviewed (if applicable)
9. Nonprofit registration verified
10. Penetration testing performed (optional but recommended)

**Integration Verification:**
- IV1: No critical vulnerabilities found
- IV2: All secrets stored securely (not in code)
- IV3: Legal docs approved by counsel

---

## 7. Success Metrics

### 7.1 Technical Success Metrics

- **Performance:**
  - Core Web Vitals meet targets (LCP ≤2.5s, FID ≤100ms, CLS ≤0.1)
  - 99.9% uptime
  - API response times <200ms (p95)

- **Quality:**
  - 100% of critical user flows covered by E2E tests
  - 0 high-severity security vulnerabilities
  - WCAG 2.1 AA compliance (100% of pages)

- **Reliability:**
  - Blockchain transaction success rate ≥98%
  - NFT minting success rate ≥95%
  - AI agent response success rate ≥99%

### 7.2 Business Success Metrics

- **Donations:**
  - 30% increase in conversion rate vs current site
  - 50% increase in average donation amount
  - 20% of donors opt for recurring donations

- **Engagement:**
  - 5,000+ page views/month within 3 months
  - 500+ blog subscribers within 6 months
  - 1,000+ wallet connections within 3 months

- **Transparency:**
  - 100% of donations tracked on blockchain
  - 500+ NFT receipts issued within 6 months

### 7.3 User Success Metrics

- **User Satisfaction:**
  - ≥4.5/5 rating on donation experience
  - ≥90% of users find desired information within 3 clicks
  - ≥80% mobile usability score

---

## 8. Next Steps After PRD Approval

1. **Architect Creates Architecture Document** - Using `brownfield-architecture-tmpl.yaml`
2. **Product Owner Reviews for Consistency** - Using PO master checklist
3. **Shard Documents** - Break PRD and Architecture into manageable pieces
4. **Story Manager Creates Stories** - Using BMAD SM agent, one epic at a time
5. **Development Begins** - SM → Dev → QA cycle for each story
6. **Deployment** - Staged rollout with feature flags

---

**END OF PRD**

*This document will be maintained in `docs/brownfield-prd.md` and versioned according to BMAD-METHOD practices.*
