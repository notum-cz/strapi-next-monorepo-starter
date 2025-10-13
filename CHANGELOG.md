# Changelog

All notable changes to the Trail Mixx project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-01

### Added - Core Infrastructure

#### Monorepo Structure
- Renamed project from `strapi-next-monorepo-starter` to `trail-mixx`
- Reorganized apps and services for radio streaming platform
- Added `services/` workspace for backend services
- Created `agents/` directory for A2A automation
- Created `configs/` directory for clock and rotation policies
- Created comprehensive `docs/` structure

#### Services
- **services/cms** (formerly apps/strapi)
  - Renamed from @repo/strapi to @repo/cms
  - Added i18n-enabled content types:
    - `Promo` - Nonprofit, BIPOC, event promotions
    - `Merchant` - Local business partners and sponsors
    - `Show` - Radio shows and programs
    - `Track` - Music tracks with locale and bin classification
  - Created seed data script with sample content
  - Configured for bilingual support (EN/ES)

- **services/stream** (NEW)
  - HLS proxy service with Node.js/Express
  - Proxies `/live/index.m3u8` and segments to HLS origin
  - Automatic fallback to MP3 when origin unavailable
  - CSV logging for plays and ads (`out/plays.csv`, `out/ads.csv`)
  - Health check (`/healthz`) and metrics (`/metrics`) endpoints
  - API endpoints for logging play and ad events

#### Applications
- **apps/web** (formerly apps/ui)
  - Renamed from @repo/ui to @repo/web
  - Added HLS Player component with hls.js support
  - Native HLS for Safari, hls.js fallback for other browsers
  - Bilingual UI (English/Spanish)
  - Accessible controls (WCAG 2.1 AA compliant)
  - Error recovery and stall handling
  - Created `/listen` page with hero design
  - Gradient background (green/gray theme)
  - Live indicator with animation
  - Added `hls.js` dependency

- **apps/mobile** (NEW)
  - Capacitor wrapper for native iOS/Android apps
  - Points to apps/web build output
  - Media session plugin for Bluetooth/lock screen controls
  - Configuration for development and production

#### Packages
- **packages/player-sdk** (NEW)
  - React component for HLS audio playback
  - TypeScript support with full type definitions
  - Embeddable widget (player.js) for any website
  - Theme customization via CSS variables
  - Bilingual support (EN/ES)
  - Ad event hooks (onAdStart, onAdEnd)
  - Auto-detection of HLS support

#### Agent System
- **agents/deepagents-runtime** (NEW)
  - Auto-onboard system for A2A agents
  - Watches docs/Agent-Cards for agent definitions
  - JSON-RPC style agent calling interface
  - Input validation against agent schemas
  - CLI for listing and calling agents

- **docs/Agent-Cards** (NEW)
  - MixerAgent card for playlist generation
  - Card schema definition and examples
  - Auto-discovery and registration system

#### Configuration
- **configs/clocks/seattle-top-hour.json**
  - Hour-long programming clock with segments
  - Music, promo, merchant, break timing
  - Bin rotation rules (A, B, C, D, L)
  - Nonprofit and BIPOC promo requirements

- **configs/rotations/rotations.yaml**
  - Standard rotation policy
  - Morning mix (upbeat)
  - Evening grooves (mellow)
  - Weekend special (extended sets)
  - Bin weights and play limits

#### Documentation
- **docs/BMAD-Playbooks/**
  - TrailMix-DailyOps.story.md - Daily operational procedures
  - TrailMix-ContentGrowth.story.md - Content strategy and growth

- **docs/poml/player.poml**
  - Protocol Object Modeling Language spec
  - Player contract with inputs, outputs, methods, events
  - Technical requirements and browser support
  - Performance and accessibility standards

- **docs/spec-kit/player.md**
  - Functional requirements (FR-1 through FR-6)
  - Performance benchmarks (LCP, FID, CLS)
  - Security and privacy requirements
  - Browser compatibility matrix
  - Test plan and acceptance criteria

- **docs/compliance/README.md**
  - SoundExchange licensing (Sections 112/114)
  - PRO licensing (ASCAP, BMI, SESAC)
  - Washington State RCW compliance
  - Non-interactive streaming rules
  - FCC considerations
  - Reporting requirements

- **DESIGN_AUDIT.md**
  - Complete design system documentation
  - Color palette and typography
  - Component patterns and layouts
  - Accessibility standards (WCAG 2.1 AA)
  - Responsive design breakpoints
  - Animation and motion principles

- **MIGRATION_NOTES.md**
  - File and directory mapping
  - Breaking changes documentation
  - v0-leonradio migration plan (pending access)
  - Deployment changes
  - Rollback procedures

#### Root Configuration
- **.env.example**
  - Consolidated environment variables for all services
  - HLS streaming configuration
  - Strapi CMS connection
  - Database credentials
  - AWS S3 and Sentry (optional)

- **package.json**
  - Updated project name and metadata
  - Added services/* to workspaces
  - New scripts: dev:cms, dev:web, dev:stream, ios, android
  - Renamed existing scripts for consistency

### Changed

#### Project Structure
- Moved `apps/strapi/` → `services/cms/`
- Renamed `apps/ui/` → `apps/web/`
- Updated docker-compose.yml name from "dev-templates" to "trail-mixx"

#### Scripts
- `dev:strapi` → `dev:cms`
- `dev:ui` → `dev:web`
- `build:strapi` → `build:cms`
- `build:ui` → `build:web`
- Added `dev` script to run web, cms, and stream concurrently

#### Package Names
- `@repo/strapi` → `@repo/cms`
- `@repo/ui` → `@repo/web`

### Technical Details

#### Dependencies Added
- **apps/web:** hls.js@^1.5.0
- **services/stream:** express@^4.18.2, axios@^1.6.0, cors@^2.8.5
- **apps/mobile:** @capacitor/core@^6.0.0, capacitor-media-session@^6.0.0
- **packages/player-sdk:** hls.js@^1.5.0, rollup@^4.9.6

#### Performance Targets
- LCP (Largest Contentful Paint): ≤ 2.5s
- FID (First Input Delay): ≤ 100ms
- CLS (Cumulative Layout Shift): ≤ 0.1
- HLS stall recovery: ≤ 2s
- Ad boundary accuracy: ±150ms

#### Accessibility Features
- Keyboard navigation (Space/Enter for play/pause)
- ARIA labels on all controls
- Screen reader state announcements
- Focus indicators (3px outline, 4.5:1 contrast)
- Color contrast ≥ 4.5:1 for text

#### Browser Support
- Safari 14+ (native HLS)
- Chrome 90+ (hls.js)
- Firefox 88+ (hls.js)
- Edge 90+ (hls.js)
- iOS Safari 11+
- Chrome Android 60+

### Known Issues

#### v0-leonradio Migration
- Repository requires authentication, automatic clone failed
- Manual migration needed when access is granted
- See MIGRATION_NOTES.md for detailed migration plan

#### Limitations
- No volume control UI (uses device volume)
- No playlist/queue support in v1
- No offline caching
- No Chromecast/AirPlay support
- Spanish translations need native speaker review

#### Development
- Stream service requires HLS origin configuration
- Mobile app requires native IDE setup (Xcode/Android Studio)
- Seed data script needs to be run manually

### Security

#### Implemented
- HTTPS required for production streams
- HLS manifest validation
- Error message sanitization (no sensitive data)
- CORS configuration
- Content Security Policy headers

#### Privacy
- No tracking without consent in embedded widget
- Minimal data collection
- Do Not Track header respected
- GDPR considerations documented

### Deployment

#### Ready for Deployment
- **Web App:** Vercel/Netlify compatible
- **CMS:** Render/Fly.io/Heroku with PostgreSQL
- **Stream Service:** Any Node.js host with persistent storage

#### Requires Configuration
- HLS origin URL
- Fallback MP3 URL
- Database credentials
- API tokens
- Licensing (SoundExchange, PROs)

### Testing

#### Implemented
- Stream service unit tests (logging)
- Content type schemas validated

#### Planned (v1.1)
- Playwright E2E tests for player
- Lighthouse CI integration
- Accessibility automated testing (axe-core)
- Load testing for stream service

### Documentation

#### Complete
- All services have README.md
- API endpoints documented
- Configuration examples provided
- Operational playbooks created
- Compliance guide written
- Design system documented
- Migration notes prepared

#### Future
- API reference documentation
- Video tutorials
- Contributor guide
- Troubleshooting guide

---

## [Unreleased]

### Planned for v1.1
- [ ] Complete v0-leonradio migration
- [ ] Playwright tests for /listen page
- [ ] Lighthouse CI in GitHub Actions
- [ ] Volume control UI
- [ ] Now playing metadata display
- [ ] Social sharing functionality

### Planned for v2.0
- [ ] Offline caching/PWA
- [ ] Playlist queue support
- [ ] Waveform visualization
- [ ] Lyrics display
- [ ] Chromecast/AirPlay support
- [ ] Apple CarPlay / Android Auto
- [ ] Event calendar integration
- [ ] Artist profile pages
- [ ] User accounts and favorites

---

[1.0.0]: https://github.com/executiveusa/trail-mixx/releases/tag/v1.0.0
