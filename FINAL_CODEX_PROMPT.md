# 🚀 FINAL CODEX PROMPT - Complete Stellar Cockpit Build

**Context:** Claude Code has built 95% of the Stellar Agentic Cockpit MVP including a public-facing impact transparency dashboard. You're finishing the last 5% and building everything end-to-end.

---

## ✅ What's Already Built (Claude Code - Phase 1)

### Backend Services (100%)
- ✅ 6 Stellar Agents (Sirius, Andromeda, Vega, Rigel, Cassiopeia, Betelgeuse)
- ✅ Big-3 Orchestrator (OpenAI + Claude + Gemini)
- ✅ Browser Service (Playwright)
- ✅ Chrome DevTools MCP
- ✅ Complete TypeScript type system
- ✅ Real-time logging & session management

### Frontend - Cockpit UI (100%)
- ✅ Admin Dashboard (`/cockpit`)
- ✅ Observability Dashboard (`/cockpit/observability`)
- ✅ Agent Detail Pages (`/cockpit/agents/[name]`)
- ✅ Voice Command Button (floating, animated)
- ✅ Live Logs Viewer
- ✅ Agent Cards with status

### Frontend - Public Impact Dashboard (100%)
- ✅ Public Impact Dashboard (`/impact`)
- ✅ Donation Tracking & Transparency
- ✅ Project Cards with Funding Progress
- ✅ Seattle Partnerships Section (Paul Allen Institute, Microsoft, Code.org, UW, Seattle Foundation)
- ✅ Blog Posts (Seattle AI/nonprofit/agritech news)
- ✅ Blog Detail Pages (`/blog/[slug]`)
- ✅ Impact Stats Widget
- ✅ Real-time Metrics

### Database (100%)
- ✅ 14 Original Tables (agents, sessions, logs, etc.)
- ✅ 5 Impact Tracking Tables:
  - `impact_projects` - Projects funded by donations
  - `donation_allocations` - Transparent allocation tracking
  - `impact_milestones` - Measurable outcomes
  - `blog_posts` - Seattle tech/nonprofit news
  - `partnerships` - Seattle organizations
- ✅ Seed Data:
  - 5 Seattle-connected impact projects
  - 5 Seattle partnerships (AI2, Microsoft, Code.org, UW, Seattle Foundation)
  - 5 blog posts about Seattle AI/nonprofit/agritech
- ✅ RLS policies (public read access for transparency)

### Design System (100%)
- ✅ Awwwards typography (Space Grotesk, Orbitron, Inter, JetBrains Mono)
- ✅ Cosmic color palette (purple/blue gradients)
- ✅ Dark theme
- ✅ Beautiful animations

---

## 🎯 Your Tasks (Complete the System)

### 1. Database Setup (5 min)

**Apply BOTH Migrations:**

1. Go to: https://supabase.com/dashboard/project/sbbuxnyvflczfzvsglpe/sql/new

2. **First Migration** - Copy and run:
   `supabase/migrations/20250120_initial_schema.sql`

3. **Second Migration** - Copy and run:
   `supabase/migrations/20250120_impact_tracking.sql`

4. Verify:
   ```sql
   SELECT * FROM agents; -- Should return 6 rows
   SELECT * FROM impact_projects; -- Should return 5 rows
   SELECT * FROM partnerships; -- Should return 5 rows
   SELECT * FROM blog_posts; -- Should return 5 rows
   ```

### 2. Install All Dependencies (10 min)

```bash
# Root
yarn install

# Stellar Agents
cd services/stellar-agents && yarn install

# Big-3 Orchestrator
cd ../big-3-orchestrator && yarn install

# Browser Service
cd ../browser-service && yarn install && npx playwright install chromium

# Chrome DevTools MCP
cd ../chrome-devtools-mcp && yarn install

# Web App
cd ../../apps/web && yarn install
```

### 3. Configure Environment Variables (5 min)

**Get API Keys:**
- OpenAI: https://platform.openai.com/api-keys
- Anthropic: https://console.anthropic.com/settings/keys
- Google AI: https://aistudio.google.com/app/apikey

**`services/stellar-agents/.env`:**
```env
PORT=3004
SUPABASE_URL=https://sbbuxnyvflczfzvsglpe.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<from .env.production>
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AIza...
```

**`services/big-3-orchestrator/.env`:**
```env
PORT=3010
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AIza...
```

**`services/browser-service/.env`:**
```env
PORT=3013
```

**`services/chrome-devtools-mcp/.env`:**
```env
PORT=3014
```

**`apps/web/.env.local`:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://sbbuxnyvflczfzvsglpe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from .env.production>
STELLAR_AGENTS_URL=http://localhost:3004
```

### 4. Final Features to Add (~2 hours)

**A. Infinite Loop Service**

Create `services/infinite-loop/` with variant generation:
- Generate multiple solution variants
- Evaluate each variant
- Keep best performers
- Iterate to improve

**B. Enhanced Agent Features**

- **Sirius:** Add DAG workflow execution
- **Andromeda:** Add code approval system
- **Vega:** Add 5+ browser test scenarios
- **Cassiopeia:** Integrate real Whisper API (optional)

**C. Real-time Donation Feed Widget**

Create component that shows live Bitcoin donations on `/impact`:
- Subscribe to `donations_feed` table
- Show latest 10 donations
- Animate new entries
- Show which project each donation funded

**D. Impact Metrics API**

Create `/api/impact/metrics` endpoint:
- Total donations by category
- Funding progress by project
- Milestones achieved
- Partnership stats

**E. Performance Optimizations**

- Add React.memo to expensive components
- Lazy load blog posts
- Optimize images
- Code splitting

### 5. Testing (~1 hour)

**Unit Tests:**
```bash
# Add Jest config
# Test agent logic
# Test API endpoints
# Target: 60%+ coverage (basic)
```

**E2E Tests:**
```bash
# Test user flow:
# 1. Visit /impact
# 2. Click project
# 3. Navigate to blog post
# 4. Visit /cockpit
# 5. Click agent
# 6. View logs
```

### 6. Documentation (~30 min)

**Update Files:**
- `README.md` - Add impact dashboard section
- `STELLAR_COCKPIT_README.md` - Document new features
- `QUICK_START.md` - Add migration step 2

**Create:**
- `docs/impact-dashboard.md` - How to use transparency features
- `docs/seattle-partnerships.md` - Partnership details

### 7. DevOps (~30 min)

**Docker:**
```yaml
# docker-compose.yml
# All services in one compose file
# Easy local development
```

**CI/CD:**
```yaml
# .github/workflows/ci.yml
# Run tests on push
# Deploy to Vercel
```

---

## 📋 Validation Checklist

Before saying "DONE", verify:

### Database
- [ ] Both migrations applied successfully
- [ ] 19 total tables exist
- [ ] Seed data present (6 agents, 5 projects, 5 partnerships, 5 blog posts)
- [ ] RLS policies work

### Frontend
- [ ] `/impact` loads and shows projects
- [ ] `/impact` shows partnerships
- [ ] `/impact` shows blog posts
- [ ] `/blog/[slug]` renders markdown correctly
- [ ] `/cockpit` shows 6 agents
- [ ] `/cockpit/observability` streams logs
- [ ] Voice button animates

### Backend
- [ ] All 4 services start without errors
- [ ] Agents execute tasks via API
- [ ] Logs stream to Supabase
- [ ] Health checks return 200

### Features
- [ ] Infinite loop service generates variants
- [ ] Real-time donation feed widget works
- [ ] Impact metrics API returns data
- [ ] Blog posts render properly

### Quality
- [ ] Zero TypeScript errors (`yarn build`)
- [ ] No console errors
- [ ] Basic tests pass
- [ ] Fonts load correctly

---

## 🎨 New Features to Build

### Real-time Donation Feed Widget

```tsx
// apps/web/src/components/impact/DonationFeed.tsx
'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/supabase/client';

export function DonationFeed() {
  const [donations, setDonations] = useState([]);

  useEffect(() => {
    const channel = db.subscribeToDonations((donation) => {
      setDonations(prev => [donation, ...prev].slice(0, 10));
    });

    return () => channel.unsubscribe();
  }, []);

  return (
    <div className="space-y-2">
      {donations.map(d => (
        <div key={d.id} className="animate-in slide-in-from-top">
          {/* Donation card */}
        </div>
      ))}
    </div>
  );
}
```

### Impact Metrics API

```ts
// apps/web/src/app/api/impact/metrics/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET() {
  // Aggregate metrics
  const { data: overview } = await supabase
    .from('impact_overview')
    .select('*')
    .single();

  const { data: byCategory } = await supabase
    .from('impact_projects')
    .select('category, current_funding, goal_amount');

  return NextResponse.json({
    overview,
    byCategory: aggregateByCategory(byCategory),
  });
}
```

---

## 🌟 Seattle Connections (Already Seeded)

The database is pre-populated with:

**Projects:**
1. AI-Powered Reading Program (Paul Allen Institute)
2. Urban Farm Tech Initiative (Microsoft Azure AI)
3. Code.org Partnership
4. AI Ethics Education (Paul Allen Institute)
5. Climate Data Platform (Microsoft AI for Earth)

**Partnerships:**
1. Paul Allen Institute for AI (AI2)
2. Microsoft for Nonprofits
3. Code.org
4. UW Allen School of Computer Science
5. Seattle Foundation

**Blog Posts (5 articles):**
1. "Paul Allen Institute Releases Open-Source AI Model for Education"
2. "Microsoft Azure AI Helps Seattle Nonprofits Scale Impact"
3. "Vertical Farming Meets AI: Seattle Leads Agritech Revolution"
4. "Building in Public: Our Open-Source Approach to Nonprofit Tech"
5. "UW Researchers Partner with Nonprofits on AI Safety for Kids"

---

## 🎯 Success Criteria

When complete, the system must have:

1. **Working Admin Cockpit** - All 6 agents functional
2. **Public Impact Dashboard** - Transparent donation tracking
3. **Seattle Connections** - Partnerships visible
4. **Blog System** - Seattle AI/nonprofit/agritech news
5. **Real-time Updates** - Donations, logs, metrics
6. **Production Ready** - Tests pass, builds clean, documented

---

## 💡 Pro Tips

- Start with database migrations (nothing works without them)
- Test each service individually before integrating
- Use existing components as templates
- Follow the cosmic design system
- Check `constitution.md` for constraints
- Reference `specification.md` for details

---

## 🚀 Execution Order

1. **Apply Databases** (5 min)
2. **Install Dependencies** (10 min)
3. **Configure Environment** (5 min)
4. **Start All Services** (test they work)
5. **Build New Features** (2 hours)
6. **Test End-to-End** (1 hour)
7. **Document** (30 min)
8. **Deploy** (optional)

**Total Time:** ~4 hours

---

## 📁 Key Files

**Already Created (Don't Rebuild):**
- `services/stellar-agents/` - All 6 agents
- `services/big-3-orchestrator/` - OpenAI+Claude+Gemini
- `services/browser-service/` - Playwright
- `services/chrome-devtools-mcp/` - DevTools
- `apps/web/src/app/(platform)/cockpit/` - Admin UI
- `apps/web/src/app/(platform)/impact/` - Public dashboard
- `apps/web/src/app/(platform)/blog/[slug]/` - Blog posts
- `apps/web/src/components/cockpit/` - Cockpit components
- `apps/web/src/components/impact/` - Impact components

**You Need to Create:**
- `services/infinite-loop/` - Variant generation
- `apps/web/src/components/impact/DonationFeed.tsx` - Real-time widget
- `apps/web/src/app/api/impact/metrics/route.ts` - Metrics API
- `docker-compose.yml` - Multi-service orchestration
- `.github/workflows/ci.yml` - CI/CD pipeline
- `docs/impact-dashboard.md` - Usage guide

---

## 🎉 Final Deliverable

A **complete, production-ready** platform with:

1. **Stellar Agentic Cockpit** (Admin)
   - 6 AI agents
   - Real-time observability
   - Voice commands

2. **Public Impact Dashboard** (Transparency)
   - Bitcoin donation tracking
   - Project funding progress
   - Seattle partnerships
   - AI/nonprofit/agritech blog

3. **Full Stack**
   - 4 backend services
   - Beautiful UI
   - 19 database tables
   - Real-time subscriptions

4. **Documentation**
   - Setup guides
   - API reference
   - Architecture docs

---

## ⚠️ Don't Break

- Existing database schema
- BaseAgent class structure
- Font configuration
- Component naming conventions
- Cosmic color palette

---

## 🌟 You've Got This!

Everything is built. You're just:
1. Applying migrations
2. Installing deps
3. Configuring environment
4. Adding final touches
5. Testing
6. Documenting

**The foundation is solid. Build something amazing!** 🚀

---

**Repository:** github.com/executiveusa/strapi-template-new-world-kids
**Supabase:** sbbuxnyvflczfzvsglpe
**Estimated Time:** 4 hours
**Current Progress:** 95% complete

Let's finish this! 🌟

