# 🏗️ STELLAR AGENTIC COCKPIT - TECHNICAL PLAN

**Version:** 1.0.0
**Date:** January 20, 2025
**Based On:** constitution.md + specification.md

---

## 📐 ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────┐
│                     USER INTERFACE                           │
│  Next.js 15 App Router + tweakcn + Tailwind CSS 4           │
│                                                              │
│  Routes:                                                     │
│  /cockpit/dashboard      - Main cockpit UI                   │
│  /cockpit/agents/[name]  - Agent detail view                 │
│  /cockpit/observability  - Real-time logs                    │
│  /cockpit/services       - Service health                    │
└─────────────────────────────────────────────────────────────┘
                         ↓ API Calls
┌─────────────────────────────────────────────────────────────┐
│                  BIG-3 ORCHESTRATOR                          │
│  Port: 3010                                                  │
│  Coordinates: OpenAI Realtime + Claude + Gemini             │
│  Health: /health                                             │
│  WebSocket: /stream (real-time logs)                         │
└─────────────────────────────────────────────────────────────┘
                         ↓ Dispatches
┌─────────────────────────────────────────────────────────────┐
│              STELLAR AGENTS SERVICE                          │
│  Port: 3004                                                  │
│                                                              │
│  Agents:                                                     │
│  - Sirius (Orchestrator)      GPT-4 Turbo                   │
│  - Andromeda (Coder)          Claude 3.5 Sonnet             │
│  - Vega (Validator)           Gemini 2.0 + Playwright       │
│  - Rigel (Researcher)         Gemini 2.0 Flash              │
│  - Cassiopeia (Voice)         GPT-4o Realtime + ElevenLabs  │
│  - Betelgeuse (Builder)       Claude 3.5 Sonnet             │
└─────────────────────────────────────────────────────────────┘
                         ↓ Uses
┌────────────────┬────────────────┬────────────────────────────┐
│  BROWSER       │  CHROME        │  INFINITE                  │
│  SERVICE       │  DEVTOOLS MCP  │  LOOP                      │
│  Port: 3013    │  Port: 3014    │  Port: 3015                │
│  Playwright    │  CDP Protocol  │  Variant Gen               │
└────────────────┴────────────────┴────────────────────────────┘
                         ↓ All Log To
┌─────────────────────────────────────────────────────────────┐
│                      SUPABASE                                │
│  PostgreSQL + Real-time Subscriptions                        │
│  Tables: agents, sessions, logs, conversations, etc.         │
│  RLS: Row Level Security enabled on all tables               │
└─────────────────────────────────────────────────────────────┘
                         ↓ Reads From
┌─────────────────────────────────────────────────────────────┐
│              EXISTING INFRASTRUCTURE                         │
│  - Strapi CMS (Port 1337)     - Content management          │
│  - Stream Service (3001)       - HLS video                   │
│  - Blockchain Service (3002)   - Solana NFT minting          │
│  - AI Agents (3003)            - Nova, Echo, Flow, Pulse     │
│  - Computer Control (3005)     - Basic Gemini control        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗂️ DIRECTORY STRUCTURE (COMPLETE)

```
strapi-template-new-world-kids/
├── .spec-kit/                      # Spec-Kit framework
│   ├── fonts/
│   │   └── typography-system.md    # ✅ CREATED
│   ├── templates/
│   └── docs/
│
├── apps/
│   └── web/
│       ├── src/
│       │   ├── app/
│       │   │   ├── (platform)/
│       │   │   │   └── cockpit/                    # NEW
│       │   │   │       ├── dashboard/
│       │   │   │       │   └── page.tsx
│       │   │   │       ├── agents/
│       │   │   │       │   └── [agentName]/
│       │   │   │       │       └── page.tsx
│       │   │   │       ├── observability/
│       │   │   │       │   └── page.tsx
│       │   │   │       ├── services/
│       │   │   │       │   └── page.tsx
│       │   │   │       └── layout.tsx
│       │   │   │
│       │   │   └── api/
│       │   │       └── voice/
│       │   │           └── command/
│       │   │               └── route.ts          # NEW
│       │   │
│       │   ├── components/
│       │   │   └── cockpit/                      # NEW
│       │   │       ├── AgentCard.tsx
│       │   │       ├── AgentHeader.tsx
│       │   │       ├── AgentStats.tsx
│       │   │       ├── ActivityFeed.tsx
│       │   │       ├── CockpitHeader.tsx
│       │   │       ├── DonationFeedWidget.tsx
│       │   │       ├── LiveLogsViewer.tsx
│       │   │       ├── LogEntry.tsx
│       │   │       ├── LogFilters.tsx
│       │   │       ├── ServicesPanel.tsx
│       │   │       ├── SessionsList.tsx
│       │   │       └── VoiceCommandButton.tsx
│       │   │
│       │   ├── hooks/                            # NEW
│       │   │   ├── useAgents.ts
│       │   │   ├── useAgent.ts
│       │   │   ├── useAgentSessions.ts
│       │   │   ├── useAgentLogs.ts
│       │   │   ├── useRealtimeLogs.ts
│       │   │   ├── useRecentActivity.ts
│       │   │   ├── useServices.ts
│       │   │   └── useVoiceCommand.ts
│       │   │
│       │   └── lib/
│       │       ├── fonts.ts                      # UPDATE
│       │       └── supabase/
│       │           └── client.ts                 # ✅ EXISTS
│       │
│       └── tailwind.config.ts                    # UPDATE
│
├── services/
│   ├── stellar-agents/                           # NEW
│   │   ├── src/
│   │   │   ├── server.ts                         # Express API
│   │   │   ├── agents/
│   │   │   │   ├── sirius/
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── planner.ts
│   │   │   │   │   └── orchestrator.ts
│   │   │   │   ├── andromeda/
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── code-generator.ts
│   │   │   │   │   ├── refactorer.ts
│   │   │   │   │   └── test-generator.ts
│   │   │   │   ├── vega/
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── ui-tester.ts
│   │   │   │   │   └── accessibility.ts
│   │   │   │   ├── rigel/
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── researcher.ts
│   │   │   │   │   └── scraper.ts
│   │   │   │   ├── cassiopeia/
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── voice-handler.ts
│   │   │   │   │   └── command-router.ts
│   │   │   │   └── betelgeuse/
│   │   │   │       ├── index.ts
│   │   │   │       ├── deployer.ts
│   │   │   │       └── monitor.ts
│   │   │   │
│   │   │   ├── base/
│   │   │   │   ├── BaseAgent.ts
│   │   │   │   └── AgentRegistry.ts
│   │   │   │
│   │   │   ├── voice/
│   │   │   │   ├── openai-realtime.ts
│   │   │   │   ├── elevenlabs-tts.ts
│   │   │   │   └── voice-router.ts
│   │   │   │
│   │   │   ├── config/
│   │   │   │   ├── supabase.ts
│   │   │   │   └── models.ts
│   │   │   │
│   │   │   ├── types/
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   └── utils/
│   │   │       ├── logger.ts
│   │   │       └── token-tracker.ts
│   │   │
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── .env.example
│   │
│   ├── big-3-orchestrator/                       # NEW
│   │   ├── src/
│   │   │   ├── server.ts
│   │   │   ├── coordinator.ts
│   │   │   ├── task-queue.ts
│   │   │   ├── agent-registry.ts
│   │   │   ├── agents/
│   │   │   │   ├── openai-agent.ts
│   │   │   │   ├── claude-agent.ts
│   │   │   │   └── gemini-agent.ts
│   │   │   ├── health/
│   │   │   │   └── monitor.ts
│   │   │   └── types/
│   │   │       └── index.ts
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── browser-service/                          # NEW
│   │   ├── src/
│   │   │   ├── server.ts
│   │   │   ├── playwright/
│   │   │   │   ├── browser-pool.ts
│   │   │   │   ├── test-runner.ts
│   │   │   │   ├── screenshot.ts
│   │   │   │   └── video.ts
│   │   │   ├── scenarios/
│   │   │   │   ├── donation-flow.ts
│   │   │   │   ├── auth-flow.ts
│   │   │   │   └── navigation.ts
│   │   │   └── types/
│   │   │       └── index.ts
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── chrome-devtools-mcp/                      # NEW
│   │   ├── src/
│   │   │   ├── server.ts
│   │   │   ├── tools/
│   │   │   │   ├── network.ts
│   │   │   │   ├── performance.ts
│   │   │   │   ├── console.ts
│   │   │   │   └── coverage.ts
│   │   │   └── types/
│   │   │       └── mcp.ts
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── infinite-loop/                            # NEW
│       ├── src/
│       │   ├── server.ts
│       │   ├── wave-generator.ts
│       │   ├── variant-creator.ts
│       │   ├── evaluator.ts
│       │   ├── spec-refiner.ts
│       │   └── types/
│       │       └── index.ts
│       ├── Dockerfile
│       ├── package.json
│       └── tsconfig.json
│
├── supabase/
│   └── migrations/
│       └── 20250120_initial_schema.sql           # ✅ CREATED
│
├── docs/                                         # NEW
│   ├── agents/
│   │   ├── sirius.md
│   │   ├── andromeda.md
│   │   ├── vega.md
│   │   ├── rigel.md
│   │   ├── cassiopeia.md
│   │   └── betelgeuse.md
│   ├── services/
│   │   ├── big-3-orchestrator.md
│   │   ├── browser-service.md
│   │   ├── chrome-devtools-mcp.md
│   │   └── infinite-loop.md
│   └── tutorials/
│       ├── getting-started.md
│       ├── voice-commands.md
│       ├── browser-automation.md
│       └── infinite-loop.md
│
├── scripts/
│   └── setup-supabase.js                         # ✅ CREATED
│
├── constitution.md                               # ✅ CREATED
├── specification.md                              # ✅ CREATED
├── plan.md                                       # ✅ THIS FILE
├── tasks.md                                      # NEXT
├── CODEX_PROMPT.md                               # ✅ CREATED
├── PROJECT_STATUS.md                             # ✅ CREATED
└── FEASIBILITY_ANALYSIS.md                       # ✅ CREATED
```

---

## 🔌 SERVICE PORTS & ENDPOINTS

| Service | Port | Health Check | Description |
|---------|------|--------------|-------------|
| **Strapi CMS** | 1337 | `/admin` | Existing - Content management |
| **Stream Service** | 3001 | `/health` | Existing - HLS streaming |
| **Blockchain** | 3002 | `/health` | Existing - Solana NFT minting |
| **AI Agents** | 3003 | `/health` | Existing - Nova, Echo, Flow, Pulse |
| **Stellar Agents** | 3004 | `/health` | **NEW** - Six stellar agents |
| **Computer Control** | 3005 | `/health` | Existing - Basic Gemini |
| **Big-3 Orchestrator** | 3010 | `/health` | **NEW** - Multi-agent coordination |
| **Browser Service** | 3013 | `/health` | **NEW** - Playwright automation |
| **Chrome DevTools MCP** | 3014 | `/health` | **NEW** - CDP integration |
| **Infinite Loop** | 3015 | `/health` | **NEW** - Variant generation |
| **Next.js Web** | 3000 | `/` | Frontend + Cockpit UI |

---

## 🗄️ DATABASE DESIGN

### Supabase Tables (New)

**Core Agent Tables:**
```sql
agents                  -- Agent registry (6 stellar agents)
agent_sessions          -- Session tracking
agent_logs              -- Observability logs (all actions)
```

**AI & Voice:**
```sql
ai_conversations        -- Chat history (multi-modal)
voice_sessions          -- Voice recordings + transcripts
```

**Blockchain:**
```sql
donations_feed          -- Real-time donation events
```

**Browser Automation:**
```sql
browser_sessions        -- Browser test sessions
```

**Infinite Loop:**
```sql
agentic_waves          -- Wave iterations
variant_results        -- Variant scores
```

**Services:**
```sql
services               -- Service registry
service_health_history -- Health check history
```

**Content:**
```sql
user_profiles          -- Extended user data
user_perks            -- User rewards
tutorials             -- Cosmic Tutorials
```

### PostgreSQL (Existing - Strapi)
**DO NOT MODIFY**
```
strapi_*              -- Strapi CMS tables
```

---

## 🔐 AUTHENTICATION & SECURITY

### Auth Flow
```
User → Supabase Auth → JWT Token
  ↓
Vercel Edge Functions (validate JWT)
  ↓
Supabase RLS (Row Level Security)
  ↓
Protected API Routes
```

### RLS Policies (Applied in Migration)
- Users can view own conversations
- Agents table is public read
- Admin-only service modifications
- Donations feed public read
- Tutorials public read (if published)

### API Keys (Environment Variables)
```bash
OPENAI_API_KEY          # Voice + Coding
ANTHROPIC_API_KEY       # Coding
GOOGLE_API_KEY          # Browser + Computer Use
ELEVENLABS_API_KEY      # TTS
SUPABASE_SERVICE_ROLE_KEY  # Database admin
```

---

## 🎨 UI/UX DESIGN SYSTEM

### Typography (Awwwards-Inspired)
- **Display:** Space Grotesk (headings, hero)
- **Cosmic:** Orbitron (technical, agent names)
- **Body:** Inter (paragraphs, UI text)
- **Code:** JetBrains Mono (logs, code blocks)
- **Serif:** Playfair Display (editorial)
- **Impact:** Bebas Neue (callouts)

### Color Palette (Cosmic Theme)
```css
--purple-primary: #667eea
--purple-secondary: #764ba2
--blue-accent: #3b82f6
--green-success: #10b981
--yellow-warning: #f59e0b
--red-error: #ef4444
--gray-bg: #0f172a (slate-950)
--gray-card: #1e293b (slate-900)
```

### Component Library
- **Source:** tweakcn-next (enhanced shadcn/ui)
- **Base:** Radix UI primitives
- **Styling:** Tailwind CSS 4.0.9
- **Icons:** Lucide React

---

## 🔄 DATA FLOW EXAMPLES

### Voice Command Flow
```
User speaks → Cassiopeia (OpenAI Realtime)
  ↓
Transcribe: "Hey Sirius, plan a new dashboard widget"
  ↓
Parse intent: { agent: "sirius", action: "plan", subject: "dashboard widget" }
  ↓
Route to Sirius agent
  ↓
Sirius plans: { steps: [...], agents: ["andromeda", "vega"] }
  ↓
Orchestrator dispatches: Andromeda (code), Vega (test)
  ↓
Results aggregated
  ↓
Cassiopeia synthesizes: "I've planned the dashboard widget. Andromeda will code it, then Vega will test it."
  ↓
Play audio response (ElevenLabs)
  ↓
Log everything to Supabase
```

### Browser Automation Flow
```
User request: "Test donation flow"
  ↓
Vega agent receives task
  ↓
Call Browser Service API: POST /api/v1/test
  ↓
Playwright launches browser
  ↓
Execute scenario: donation-flow.ts
  ↓
Capture screenshots at each step
  ↓
Run assertions
  ↓
Generate test report
  ↓
Store in browser_sessions table
  ↓
Return to Vega
  ↓
Vega logs result
  ↓
User sees pass/fail in dashboard
```

### Real-time Observability Flow
```
Agent performs action
  ↓
Insert into agent_logs table
  ↓
Supabase Real-time triggers
  ↓
WebSocket pushes to all subscribed clients
  ↓
Dashboard updates live (no refresh)
  ↓
LogEntry component renders new log
```

---

## 📦 DEPLOYMENT STRATEGY

### Phase 1: Development (Local)
```bash
# Terminal 1: Supabase (already running)
# Terminal 2: Strapi CMS
cd services/cms && yarn develop

# Terminal 3: Stellar Agents
cd services/stellar-agents && yarn dev

# Terminal 4: Big-3 Orchestrator
cd services/big-3-orchestrator && yarn dev

# Terminal 5: Browser Service
cd services/browser-service && yarn dev

# Terminal 6: Next.js Web
cd apps/web && yarn dev
```

### Phase 2: Staging (Railway/Render)
- **Stellar Agents** → Railway (Node.js)
- **Big-3 Orchestrator** → Railway
- **Browser Service** → Railway (with Playwright + Chromium)
- **Chrome DevTools MCP** → Railway
- **Infinite Loop** → Railway

### Phase 3: Production (Vercel + Railway)
- **Frontend (Next.js)** → Vercel Edge
- **Backend Services** → Railway Pro
- **Database** → Supabase Pro
- **CDN** → Vercel Edge Network
- **Monitoring** → Sentry + Supabase Dashboard

---

## 🧪 TESTING STRATEGY

### Unit Tests (Vitest)
```typescript
// Example: services/stellar-agents/src/agents/sirius/__tests__/planner.test.ts
describe('Sirius Planner', () => {
  test('decomposes complex task into sub-tasks', async () => {
    const task = { description: 'Add voice notifications' };
    const plan = await sirius.planFeature(task);

    expect(plan.steps).toHaveLength(3);
    expect(plan.steps[0].agent).toBe('andromeda');
    expect(plan.steps[1].agent).toBe('vega');
  });
});
```

### Integration Tests (Playwright)
```typescript
// Example: apps/web/tests/cockpit-dashboard.spec.ts
test('dashboard displays all agents', async ({ page }) => {
  await page.goto('http://localhost:3000/cockpit/dashboard');

  await expect(page.locator('text=Sirius')).toBeVisible();
  await expect(page.locator('text=Andromeda')).toBeVisible();
  await expect(page.locator('text=Vega')).toBeVisible();
  // ... all 6 agents
});
```

### E2E Tests (Critical Paths)
```typescript
test('voice command executes task', async ({ page }) => {
  await page.goto('http://localhost:3000/cockpit/dashboard');

  // Click voice button
  await page.click('[data-testid="voice-command-button"]');

  // Simulate voice input (mocked)
  await page.evaluate(() => {
    window.mockVoiceInput('Hey Sirius, plan a new feature');
  });

  // Wait for processing
  await page.waitForSelector('text=I\'ll help you plan that feature');

  // Verify Sirius session created
  const sessions = await page.evaluate(async () => {
    const res = await fetch('/api/agents/sirius/sessions');
    return res.json();
  });

  expect(sessions.length).toBeGreaterThan(0);
});
```

---

## ⚡ PERFORMANCE OPTIMIZATION

### Code Splitting
```typescript
// Dynamic imports for agents
const Sirius = dynamic(() => import('@/components/cockpit/agents/Sirius'), {
  loading: () => <Skeleton />,
});
```

### Image Optimization
```tsx
import Image from 'next/image';

<Image
  src="/agents/sirius-icon.png"
  width={64}
  height={64}
  alt="Sirius Agent"
  loading="lazy"
/>
```

### Font Optimization
```typescript
// Use Next.js font optimization (already in fonts.ts)
import { spaceGrotesk } from '@/lib/fonts';

<html className={spaceGrotesk.variable}>
```

### Database Indexing
```sql
-- Indexes created in migration
CREATE INDEX idx_agent_logs_session_id ON agent_logs(session_id);
CREATE INDEX idx_agent_logs_created_at ON agent_logs(created_at DESC);
CREATE INDEX idx_agent_sessions_agent_id ON agent_sessions(agent_id);
```

---

## 🔧 CONFIGURATION FILES

### Tailwind Config (Update Required)
```typescript
// apps/web/tailwind.config.ts
import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', ...defaultTheme.fontFamily.sans],
        display: ['var(--font-space-grotesk)', ...defaultTheme.fontFamily.sans],
        cosmic: ['var(--font-orbitron)', 'monospace'],
        mono: ['var(--font-jetbrains-mono)', ...defaultTheme.fontFamily.mono],
        serif: ['var(--font-playfair)', ...defaultTheme.fontFamily.serif],
        impact: ['var(--font-bebas)', 'sans-serif'],
      },
      colors: {
        cosmic: {
          purple: '#667eea',
          blue: '#3b82f6',
          pink: '#ec4899',
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

### TypeScript Config (Base for Services)
```json
// services/stellar-agents/tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## 📊 MONITORING & OBSERVABILITY

### Metrics to Track
1. **Agent Performance**
   - Response time per agent
   - Token usage per session
   - Success rate (completed vs failed)
   - Cost per agent invocation

2. **Service Health**
   - Uptime percentage
   - Error rate
   - Response time (p50, p95, p99)
   - Active connections

3. **User Engagement**
   - Voice commands per day
   - Dashboard page views
   - Agent invocations per user
   - Tutorial views

### Logging Strategy
```typescript
// Structured logging
await supabase.from('agent_logs').insert({
  agent_id: 'sirius',
  session_id: sessionId,
  log_level: 'info',
  message: 'Planning feature implementation',
  tool_call: 'task_decomposition',
  thought_process: 'Breaking down into 3 sub-tasks based on complexity',
  metadata: {
    task_complexity: 'high',
    estimated_time: '25 minutes',
    confidence: 0.85,
  },
  created_at: new Date().toISOString(),
});
```

---

## 🚀 GO-LIVE CHECKLIST

Before production deployment:

### Infrastructure
- [ ] Supabase migration applied
- [ ] All services deployed and healthy
- [ ] Environment variables set in Vercel
- [ ] Database backups configured
- [ ] CDN configured

### Security
- [ ] RLS policies tested
- [ ] API keys rotated
- [ ] CORS configured
- [ ] Rate limiting enabled
- [ ] HTTPS enforced

### Performance
- [ ] Lighthouse score > 90
- [ ] All images optimized
- [ ] Fonts preloaded
- [ ] Code split applied
- [ ] Database queries optimized

### Monitoring
- [ ] Sentry configured
- [ ] Health checks verified
- [ ] Alerting rules set
- [ ] Log retention configured

### Documentation
- [ ] README.md updated
- [ ] API docs generated
- [ ] Tutorials published
- [ ] Video demos created

---

## 🎯 SUCCESS CRITERIA

### Phase 1 (Week 1)
- ✅ All 6 agents operational
- ✅ Voice commands working
- ✅ Dashboard accessible
- ✅ Real-time logs streaming
- ✅ 3+ tutorials published

### Phase 2 (Week 2)
- ✅ Browser automation functional
- ✅ Big-3 orchestrator coordinating agents
- ✅ Infinite loop generating variants
- ✅ 10+ agent sessions per day
- ✅ 95% uptime

### Phase 3 (Week 3+)
- ✅ 100+ users onboarded
- ✅ 1000+ agent invocations
- ✅ Community contributions
- ✅ 4.5/5 user satisfaction
- ✅ 99.9% uptime SLA

---

**This plan is complete and implementation-ready.**

**Next:** See tasks.md for detailed implementation checklist.
