# 🏠 Portugal Real Estate Affiliate Site

A content-driven comparison and review platform for real estate investment companies in Portugal. Built as a monorepo with Next.js (frontend) and Strapi CMS (backend).

> Think Booking.com, but for property investment companies — helping users find and compare investment platforms, while earning affiliate commissions on referrals.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router, SSR) |
| CMS / Backend | Strapi v5 |
| Database | PostgreSQL |
| Styling | Tailwind CSS |
| Deployment | Render.com |
| i18n | next-intl |
| Rich text | react-markdown + remark-gfm |
| Maps | react-leaflet |

---

## Project Structure

```
strapi-next-monorepo-starter/
├── apps/
│   ├── frontend/                  # Next.js app
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── [locale]/
│   │   │   │   │   ├── page.tsx               # Homepage
│   │   │   │   │   ├── companies/
│   │   │   │   │   │   ├── page.tsx           # All companies listing
│   │   │   │   │   │   └── [slug]/page.tsx    # Company review page
│   │   │   │   │   ├── articles/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   └── [slug]/page.tsx
│   │   │   │   │   └── regions/[slug]/page.tsx
│   │   │   │   ├── sitemap.ts
│   │   │   │   └── robots.ts
│   │   │   ├── components/
│   │   │   │   ├── CompanyCard.tsx
│   │   │   │   ├── ComparisonTable.tsx
│   │   │   │   ├── AffiliateLink.tsx
│   │   │   │   └── RegionMap.tsx
│   │   │   └── lib/
│   │   │       └── strapi.ts                  # API client
│   └── backend/                   # Strapi CMS
│       └── src/
│           └── api/
│               ├── company/
│               ├── article/
│               ├── region/
│               └── comparison-table/
├── packages/                      # Shared types, utils
└── docker-compose.yml
```

---

## Content Model (Strapi)

### `Company` (Collection Type)
The core entity — one entry per investment company reviewed.

| Field | Type | Notes |
|---|---|---|
| `name` | Text | Required |
| `slug` | UID | Auto-generated from name |
| `logo` | Media | Company logo |
| `founded_year` | Number | |
| `min_investment_eur` | Number | Minimum investment in EUR |
| `affiliate_url` | Text | Tracked outbound link |
| `short_description` | Text | Used in listing cards |
| `full_review` | Rich Text | Markdown, rendered on review page |
| `pros` | JSON | Array of strings |
| `cons` | JSON | Array of strings |
| `is_featured` | Boolean | Shown on homepage |
| `seo_title` | Text | Overrides page title |
| `seo_description` | Text | Meta description |

### `Article` (Collection Type)
SEO content — guides, comparisons, "best of" lists.

### `Region` (Collection Type)
Geographic areas (Lisbon, Algarve, Porto) powering the interactive map.

| Field | Type | Notes |
|---|---|---|
| `name` | Text | |
| `slug` | UID | |
| `color_hex` | Text | Map highlight color |
| `latitude / longitude` | Decimal | |
| `featured_companies` | Relation | Many-to-many → Company |

### `ComparisonTable` (Single Type)
Global comparison table rendered on the homepage.

---

## Localization

The site supports multiple locales via Strapi's i18n plugin and `next-intl`.

**Supported locales:**
- `en` — English (default)
- `pt` — Portuguese
- `es` — Spanish (planned)

All Strapi collection types have i18n enabled. Even during MVP with English-only content, the multilingual URL structure is in place:

```
/en/companies/abc-investments
/pt/companies/abc-investments
```

> ⚠️ Do not add content in Strapi before enabling i18n on the content type — migrating existing entries is painful.

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL (or use Docker)
- npm / yarn / pnpm

### 1. Clone and install

```bash
git clone https://github.com/your-org/strapi-next-monorepo-starter
cd strapi-next-monorepo-starter
npm install
```

### 2. Environment variables

**Backend** (`apps/backend/.env`):
```env
DATABASE_CLIENT=postgres
DATABASE_URL=postgresql://user:password@localhost:5432/portugal_re
APP_KEYS=your-app-keys
API_TOKEN_SALT=your-salt
ADMIN_JWT_SECRET=your-secret
JWT_SECRET=your-jwt-secret
```

**Frontend** (`apps/frontend/.env.local`):
```env
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=your-api-token
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Start development

```bash
# Start both services in parallel
npm run dev

# Or individually
npm run dev --workspace=apps/backend    # Strapi on :1337
npm run dev --workspace=apps/frontend   # Next.js on :3000
```

### 4. Strapi admin setup

1. Open `http://localhost:1337/admin`
2. Create your admin account
3. Go to **Settings → API Tokens** → create a token for the frontend
4. Go to **Settings → Internationalization** → add `pt` locale
5. Go to **Settings → Roles → Public** → enable `find` and `findOne` for all content types

---

## Deployment (Render.com)

The app deploys as three Render services from the same repo.

### Services

| Service | Type | Root dir | Build command | Start command |
|---|---|---|---|---|
| `portugal-cms` | Web Service | `apps/backend` | `npm run build` | `npm run start` |
| `portugal-frontend` | Web Service | `apps/frontend` | `npm run build` | `npm run start` |
| `portugal-db` | PostgreSQL | — | — | — |

### Environment variables on Render

Set `DATABASE_URL` on the backend service using Render's internal PostgreSQL connection string. Set `NEXT_PUBLIC_STRAPI_URL` on the frontend to the backend's Render internal URL (faster, no egress cost).

### Deploy steps

1. Push to `main` branch
2. Render auto-deploys both services
3. Run `npm run strapi export` locally and import to production for initial content

---

## SEO

Every page implements `generateMetadata` pulling `seo_title`, `seo_description`, and `og:image` from Strapi. Canonical URLs and `hreflang` alternate links are set per locale.

Dynamic `sitemap.xml` and `robots.txt` are generated via Next.js App Router conventions (`app/sitemap.ts`, `app/robots.ts`).

**After first deploy:** add the site to [Google Search Console](https://search.google.com/search-console) immediately — indexing takes weeks, so start the clock early.

---

## Affiliate links

All outbound company links go through the `AffiliateLink` component, which appends UTM parameters and fires an analytics event on click:

```
https://company.com?utm_source=investportugal&utm_medium=affiliate&utm_campaign={company-slug}
```

Analytics events are tracked via Plausible (privacy-friendly, no cookie banner needed).

---

## Roadmap

- [x] Monorepo scaffold (Next.js + Strapi)
- [ ] Core content types (Company, Article, Region)
- [ ] i18n setup (EN + PT)
- [ ] Homepage + company listing page
- [ ] Company review page with affiliate CTA
- [ ] Interactive Portugal map (react-leaflet)
- [ ] Comparison table
- [ ] SEO metadata + sitemap
- [ ] Deploy MVP to Render
- [ ] Google Search Console setup
- [ ] Spanish locale (ES)
- [ ] Side-by-side company comparison tool

---

## License

Private project. All rights reserved.
