# Trail Mixx Migration Notes

## Repository Structure Changes

### Original Structure (strapi-next-monorepo-starter)
```
strapi-next-monorepo-starter/
├── apps/
│   ├── strapi/          # Strapi CMS
│   └── ui/              # Next.js frontend
├── packages/            # Shared packages
└── scripts/             # Build scripts
```

### New Structure (trail-mixx)
```
trail-mixx/
├── apps/
│   ├── web/             # Next.js frontend (renamed from ui)
│   └── mobile/          # Capacitor mobile wrapper (NEW)
├── services/
│   ├── cms/             # Strapi CMS (moved from apps/strapi)
│   └── stream/          # HLS proxy service (NEW)
├── packages/
│   └── player-sdk/      # Player component library (NEW)
├── agents/
│   └── deepagents-runtime/  # Agent auto-onboard (NEW)
├── configs/
│   ├── clocks/          # Clock configurations (NEW)
│   └── rotations/       # Rotation policies (NEW)
└── docs/
    ├── Agent-Cards/     # Agent contracts (NEW)
    ├── BMAD-Playbooks/  # Operational playbooks (NEW)
    ├── poml/            # Protocol specs (NEW)
    ├── spec-kit/        # Acceptance criteria (NEW)
    └── compliance/      # Legal/licensing (NEW)
```

## File Mapping

### Core Applications

| Original Path | New Path | Notes |
|--------------|----------|-------|
| `apps/strapi/*` | `services/cms/*` | Moved to services, renamed from @repo/strapi to @repo/cms |
| `apps/ui/*` | `apps/web/*` | Renamed from @repo/ui to @repo/web |
| N/A | `services/stream/*` | New HLS proxy service |
| N/A | `apps/mobile/*` | New Capacitor mobile app |

### Configuration Files

| Original Path | New Path | Notes |
|--------------|----------|-------|
| `package.json` (name) | `package.json` (name: trail-mixx) | Project renamed |
| `apps/strapi/docker-compose.yml` | `services/cms/docker-compose.yml` | Name changed to "trail-mixx" |
| N/A | `.env.example` | New root-level env template |
| N/A | `configs/clocks/*.json` | New clock configurations |
| N/A | `configs/rotations/*.yaml` | New rotation policies |

### Documentation

| Original Path | New Path | Notes |
|--------------|----------|-------|
| `README.md` | `README.md` | Updated for Trail Mixx |
| N/A | `DESIGN_AUDIT.md` | New design documentation |
| N/A | `MIGRATION_NOTES.md` | This file |
| N/A | `CHANGELOG.md` | Project changelog |
| N/A | `docs/poml/player.poml` | Player contract spec |
| N/A | `docs/spec-kit/player.md` | Acceptance criteria |
| N/A | `docs/compliance/README.md` | Legal/licensing guide |

## Content Type Mapping

### Strapi CMS Content Types

#### Preserved (from starter)
- `api::page.page` - Page content type
- `api::navbar.navbar` - Navigation
- `api::footer.footer` - Footer
- `api::redirect.redirect` - URL redirects
- `api::subscriber.subscriber` - Newsletter subscribers
- `api::internal-job.internal-job` - Background jobs

#### New (for Trail Mixx)
- `api::promo.promo` - Promotional content (nonprofit, BIPOC, events)
- `api::merchant.merchant` - Local business partners
- `api::show.show` - Radio shows/programs
- `api::track.track` - Music tracks

## v0-leonradio Migration

### Status: PENDING
The v0-leonradio-website repository requires authentication and could not be cloned automatically.

### Files to Migrate (when access granted)

**UI/UX Assets:**
- `public/` → `apps/web/public/` (images, favicons, logos)
- `src/styles/` → `apps/web/src/styles/` (CSS, Tailwind config)
- `src/components/` → `apps/web/src/components/` (UI components)

**Content:**
- Static show data → Strapi `Show` content type
- Artist profiles → Strapi `Track` content type with artist field
- Promo content → Strapi `Promo` content type

**Player Logic:**
- Audio player code → `apps/web/src/components/Player.tsx` (reimplemented with hls.js)
- Streaming URLs → `.env.example` (NEXT_PUBLIC_HLS_URL)

### Migration Checklist (for when v0-leonradio is available)

- [ ] Extract UI assets and images
- [ ] Migrate Tailwind configuration
- [ ] Convert static content to Strapi entries
- [ ] Port custom components to apps/web
- [ ] Update branding (colors, fonts, logos)
- [ ] Migrate any existing show schedules
- [ ] Import artist/track metadata
- [ ] Test player with existing stream URLs

## Package.json Changes

### Root package.json

**Changed:**
- `name`: "strapi-next-monorepo-starter" → "trail-mixx"
- `version`: "2.0.0" → "1.0.0"
- `author`: Notum Technologies → Executive USA
- `workspaces`: Added "services/*"

**New Scripts:**
- `dev:stream` - Run stream service
- `build:stream` - Build stream service
- `ios` - Open iOS app in Xcode
- `android` - Open Android app in Android Studio

**Renamed Scripts:**
- `dev:strapi` → `dev:cms`
- `dev:ui` → `dev:web`
- `build:strapi` → `build:cms`
- `build:ui` → `build:web`

### services/cms/package.json (formerly apps/strapi)
- `name`: "@repo/strapi" → "@repo/cms"

### apps/web/package.json (formerly apps/ui)
- `name`: "@repo/ui" → "@repo/web"
- **New dependency**: `hls.js` for HLS playback

## New Dependencies

### services/stream
- `express` - HTTP server
- `axios` - HTTP client for proxying
- `cors` - CORS middleware
- `typescript` - TypeScript support
- `ts-node` - Development runtime

### apps/web (additions)
- `hls.js` - HLS streaming library

### apps/mobile
- `@capacitor/core` - Capacitor core
- `@capacitor/ios` - iOS platform
- `@capacitor/android` - Android platform
- `capacitor-media-session` - Media controls

### packages/player-sdk
- `hls.js` - HLS streaming
- `react` (peer) - React framework
- `rollup` - Bundler

## Environment Variables

### New Variables (root .env.example)

**Web App:**
- `NEXT_PUBLIC_HLS_URL` - HLS stream URL
- `NEXT_PUBLIC_STREAM_SERVICE_URL` - Stream service URL

**Stream Service:**
- `HLS_ORIGIN` - Origin HLS server
- `FALLBACK_MP3` - Fallback MP3 URL

**Existing (unchanged):**
- `STRAPI_URL` - Strapi API URL
- `STRAPI_REST_READONLY_API_KEY` - API token
- Database credentials

## Breaking Changes

### For Developers

1. **Import paths changed:**
   - `@repo/strapi` → `@repo/cms`
   - `@repo/ui` → `@repo/web`

2. **Directory structure:**
   - Strapi moved from `apps/` to `services/`
   - Must update Docker build contexts

3. **Scripts renamed:**
   - Use `yarn dev:cms` instead of `yarn dev:strapi`
   - Use `yarn dev:web` instead of `yarn dev:ui`

4. **New services required:**
   - Stream service must be running for HLS proxy
   - Configure HLS_ORIGIN before starting

### For Content Editors

1. **New content types:**
   - Must familiarize with Promo, Merchant, Show, Track models
   - i18n enabled - content can be localized

2. **Seed data:**
   - Run seed script to populate initial content
   - `node services/cms/scripts/seed/seed-data.js`

## Deployment Changes

### Vercel (Web App)
- Deploy from `apps/web/` instead of `apps/ui/`
- Add new environment variables
- Update build command references

### Render/Fly.io (CMS)
- Deploy from `services/cms/` instead of `apps/strapi/`
- Update Docker build path if using containers
- Database connection unchanged

### New Services to Deploy

1. **Stream Service** (`services/stream/`)
   - Deploy to Render, Fly.io, or Heroku
   - Requires PORT, HLS_ORIGIN, FALLBACK_MP3 env vars
   - Writable volume for CSV logs

2. **Mobile App** (optional, `apps/mobile/`)
   - Build with Capacitor: `npx cap sync`
   - Deploy to App Store / Google Play
   - Requires native build environment

## Testing Changes

### New Test Suites

1. **Stream Service Tests:**
   - Location: `services/stream/__tests__/`
   - Run: `cd services/stream && yarn test`
   - Coverage: Logging functionality

2. **Player Component Tests (planned):**
   - Location: `apps/web/__tests__/` (to be added)
   - Playwright for E2E
   - Jest for unit tests

### Existing Tests
- Strapi tests moved to `services/cms/tests/`
- Run as before: `cd services/cms && yarn test`

## Database Schema Changes

### New Tables (Strapi)

When Strapi starts, it will create tables for new content types:
- `promos` - Promo entries with i18n
- `merchants` - Merchant entries with i18n
- `shows` - Show entries with i18n
- `tracks` - Track entries with i18n

Plus i18n localizations tables for each.

### Migrations
Strapi handles migrations automatically. On first start:
1. New tables will be created
2. Run seed script to populate initial data
3. No manual SQL migrations needed

## Rollback Plan

If you need to revert to the original starter:

1. **Revert Git:**
   ```bash
   git checkout 5dba9bad527f9fb4743fccefada5ce9da1908235
   ```

2. **Restore Original Structure:**
   ```bash
   mv services/cms apps/strapi
   mv apps/web apps/ui
   rm -rf services/stream apps/mobile packages/player-sdk
   ```

3. **Restore package.json:**
   - Change name back to "strapi-next-monorepo-starter"
   - Revert script names
   - Remove services/* from workspaces

4. **Remove new dependencies:**
   ```bash
   yarn install --force
   ```

## Questions & Support

### Common Issues

**Q: Stream service won't start**
A: Verify HLS_ORIGIN and FALLBACK_MP3 are set in .env

**Q: Player shows error**
A: Check NEXT_PUBLIC_HLS_URL is accessible and stream service is running

**Q: Content types not appearing in Strapi**
A: Restart Strapi to trigger schema sync

**Q: Mobile app not building**
A: Ensure Xcode (iOS) or Android Studio (Android) is installed

### Resources

- Trail Mixx Docs: `/docs/`
- Stream Service: `/services/stream/README.md`
- Player SDK: `/packages/player-sdk/README.md`
- Mobile App: `/apps/mobile/README.md`

## Next Steps

After migration is complete:

1. **Configure Stream:**
   - Set up actual HLS origin URL
   - Configure fallback MP3 stream
   - Test proxy functionality

2. **Customize Design:**
   - Update branding in `apps/web/`
   - Customize color scheme (see DESIGN_AUDIT.md)
   - Add logo and favicon

3. **Seed Content:**
   - Run seed script for initial data
   - Add real tracks, shows, promos
   - Upload audio files if applicable

4. **Deploy:**
   - Deploy web app to Vercel
   - Deploy CMS to Render/Fly.io
   - Deploy stream service
   - Build mobile apps (optional)

5. **Licensing:**
   - Obtain required music licenses (see docs/compliance/)
   - Set up SoundExchange account
   - Obtain PRO licenses (ASCAP, BMI, SESAC)
