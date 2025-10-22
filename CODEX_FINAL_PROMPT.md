# 🚀 FINAL CODEX PROMPT - STELLAR AGENTIC COCKPIT

**COPY THIS ENTIRE FILE AND PASTE INTO GPT-5-CODEX (ChatGPT Pro / GitHub Copilot)**

---

## ⚡ QUICK START INSTRUCTIONS

You are **GPT-5-Codex**, about to build the **Stellar Agentic Cockpit** for New World Kids.

**Your Task:** Build 110-171 files implementing six AI agents (named after stars), voice integration, browser automation, a Next.js cockpit UI, and an infinite agentic loop system.

**Timeline:** 4-8 hours (use adaptive reasoning - fast for simple, deep for complex)

**Repository:** github.com/executiveusa/strapi-template-new-world-kids
**Branch:** main
**Supabase Project:** sbbuxnyvflczfzvsglpe

---

## 📚 REQUIRED READING (Read ALL these files in the repository)

**CRITICAL - Read these files in this EXACT order before writing ANY code:**

1. **`constitution.md`** - The 12 commandments. Non-negotiable rules. Read FIRST.
2. **`specification.md`** - 71KB complete PRD. Read SECOND.
3. **`plan.md`** - Technical architecture, file structure, data flows
4. **`tasks.md`** - 150+ task checklist (your implementation roadmap)
5. **`.spec-kit/fonts/typography-system.md`** - Awwwards typography guide

---

## 🚨 THE 12 COMMANDMENTS (From constitution.md)

**ABSOLUTE RULES - BREAKING THESE = FAILURE:**

1. ⛔ **NEVER modify `services/cms/`, `services/stream/`, or existing backend files**
2. 🌌 **ALL agents MUST have cosmic names** (Sirius, Andromeda, Vega, Rigel, Cassiopeia, Betelgeuse)
3. 🎨 **USE tweakcn-next ONLY** for UI components
4. 🖋️ **FOLLOW typography system** (Space Grotesk, Orbitron, Inter, JetBrains Mono)
5. 🔐 **USE Supabase for all new data** (never touch Strapi's database)
6. 🎙️ **VOICE-FIRST** - Support voice commands everywhere
7. 🔄 **IDEMPOTENT** - All operations safe to run multiple times
8. 📊 **OBSERVABLE** - Log everything to `agent_logs` table
9. 💰 **TOKEN BUDGET** - Track usage, warn at 80%
10. 🛡️ **SAFETY-FIRST** - Require confirmation for destructive operations
11. 🧩 **MODULAR** - Easy to add new agents/services
12. 📚 **DOCUMENTED** - Every feature has markdown docs

---

## 🗂️ PROJECT CONTEXT

### Existing Infrastructure (DO NOT MODIFY)
```
services/cms/              # Strapi CMS - READ ONLY
services/stream/           # HLS streaming - READ ONLY
services/ai-agents/        # Existing AI agents (Nova, Echo, Flow, Pulse)
services/blockchain/       # Solana NFT minting
services/computer-control/ # Basic Gemini control
```

### Technology Stack
- **Frontend:** Next.js 15.4.7, React 18, Tailwind CSS 4.0.9
- **UI Library:** tweakcn-next (enhanced shadcn/ui)
- **Database:** Supabase (PostgreSQL + Real-time)
- **Fonts:** Space Grotesk, Orbitron, Inter, JetBrains Mono (Google Fonts)
- **Auth:** NextAuth + Supabase Auth

### What You're Building (NEW)
```
services/stellar-agents/       # Six cosmic AI agents
services/big-3-orchestrator/   # Multi-agent coordination
services/browser-service/      # Playwright automation
services/chrome-devtools-mcp/  # Chrome DevTools MCP
services/infinite-loop/        # Variant generation system
apps/web/src/app/(platform)/cockpit/  # Cockpit UI
```

---

## 🌟 THE SIX STELLAR AGENTS

Build these six agents in `services/stellar-agents/src/agents/`:

### 1. Sirius - The Navigator (Orchestrator)
- **Model:** GPT-4 Turbo
- **Role:** Plan features, coordinate sub-agents, navigate workflows
- **Location:** `services/stellar-agents/src/agents/sirius/`
- **Methods:** `planFeature()`, `decomposeTask()`, `assignAgent()`

### 2. Andromeda - The Coder
- **Model:** Claude 3.5 Sonnet
- **Role:** Code generation, refactoring, debugging, testing
- **Location:** `services/stellar-agents/src/agents/andromeda/`
- **Methods:** `generateCode()`, `refactor()`, `debug()`, `reviewCode()`, `generateTests()`

### 3. Vega - The Validator (Browser Testing)
- **Model:** Gemini 2.0 Flash + Playwright
- **Role:** UI testing, visual regression, accessibility audits
- **Location:** `services/stellar-agents/src/agents/vega/`
- **Methods:** `testUI()`, `visualRegression()`, `accessibilityAudit()`, `performanceTest()`

### 4. Rigel - The Researcher
- **Model:** Gemini 2.0 Flash
- **Role:** Web research, data extraction, competitive analysis
- **Location:** `services/stellar-agents/src/agents/rigel/`
- **Methods:** `research()`, `scrapeData()`, `analyzeCompetitor()`, `findAPIs()`

### 5. Cassiopeia - The Communicator (Voice)
- **Model:** GPT-4o Realtime + ElevenLabs
- **Role:** Voice recognition, TTS, command routing
- **Location:** `services/stellar-agents/src/agents/cassiopeia/`
- **Methods:** `transcribeVoice()`, `synthesizeSpeech()`, `handleCommand()`, `summarizeConversation()`

### 6. Betelgeuse - The Builder (DevOps)
- **Model:** Claude 3.5 Sonnet
- **Role:** Deployments, CI/CD, monitoring, infrastructure
- **Location:** `services/stellar-agents/src/agents/betelgeuse/`
- **Methods:** `deploy()`, `createPipeline()`, `monitorService()`, `scaleService()`

---

## 🗄️ DATABASE (CRITICAL - DO THIS FIRST!)

### Step 1: Apply Supabase Migration

**BEFORE WRITING ANY CODE:**

1. Go to: https://supabase.com/dashboard/project/sbbuxnyvflczfzvsglpe
2. Click "SQL Editor" in left sidebar
3. Create "New query"
4. Copy the ENTIRE contents of `supabase/migrations/20250120_initial_schema.sql`
5. Paste and click "Run"
6. Verify success: `SELECT * FROM agents;` should return 6 rows

### Tables Created (14 total)
- `agents` - Six stellar agents registry
- `agent_sessions` - Session tracking
- `agent_logs` - Observability logs
- `ai_conversations` - Chat history
- `voice_sessions` - Voice recordings
- `donations_feed` - Real-time donations
- `browser_sessions` - Browser tests
- `agentic_waves` - Infinite loop waves
- `variant_results` - Variant scores
- `services` - Service registry
- `service_health_history` - Health checks
- `user_profiles` - Extended user data
- `user_perks` - User rewards
- `tutorials` - Cosmic Tutorials

**All tables have Row Level Security (RLS) enabled.**

---

## 📂 FILE STRUCTURE TO CREATE

```
services/
├── stellar-agents/                    # NEW
│   ├── src/
│   │   ├── agents/
│   │   │   ├── sirius/               # Orchestrator
│   │   │   ├── andromeda/            # Coder
│   │   │   ├── vega/                 # Validator
│   │   │   ├── rigel/                # Researcher
│   │   │   ├── cassiopeia/           # Voice
│   │   │   └── betelgeuse/           # Builder
│   │   ├── base/
│   │   │   ├── BaseAgent.ts
│   │   │   └── AgentRegistry.ts
│   │   ├── voice/
│   │   │   ├── openai-realtime.ts
│   │   │   ├── elevenlabs-tts.ts
│   │   │   └── voice-router.ts
│   │   ├── config/
│   │   │   └── supabase.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── server.ts
│   ├── Dockerfile
│   └── package.json
│
├── big-3-orchestrator/                # NEW
│   ├── src/
│   │   ├── coordinator.ts
│   │   ├── agents/
│   │   │   ├── openai-agent.ts
│   │   │   ├── claude-agent.ts
│   │   │   └── gemini-agent.ts
│   │   ├── health/
│   │   │   └── monitor.ts
│   │   └── server.ts
│   └── package.json
│
├── browser-service/                   # NEW (Playwright)
│   ├── src/
│   │   ├── playwright/
│   │   │   ├── browser-pool.ts
│   │   │   └── test-runner.ts
│   │   ├── scenarios/
│   │   │   ├── donation-flow.ts
│   │   │   └── auth-flow.ts
│   │   └── server.ts
│   └── package.json
│
├── chrome-devtools-mcp/               # NEW
│   ├── src/
│   │   ├── tools/
│   │   │   ├── network.ts
│   │   │   └── performance.ts
│   │   └── server.ts
│   └── package.json
│
└── infinite-loop/                     # NEW
    ├── src/
    │   ├── wave-generator.ts
    │   ├── evaluator.ts
    │   └── server.ts
    └── package.json

apps/web/src/
├── app/(platform)/cockpit/            # NEW
│   ├── dashboard/page.tsx
│   ├── agents/[agentName]/page.tsx
│   ├── observability/page.tsx
│   └── layout.tsx
│
├── components/cockpit/                # NEW
│   ├── AgentCard.tsx
│   ├── LiveLogsViewer.tsx
│   ├── VoiceCommandButton.tsx
│   └── DonationFeedWidget.tsx
│
├── hooks/                             # NEW
│   ├── useAgents.ts
│   ├── useRealtimeLogs.ts
│   └── useVoiceCommand.ts
│
└── lib/
    └── fonts.ts                       # UPDATE

docs/                                  # NEW
├── agents/
│   ├── sirius.md
│   ├── andromeda.md
│   ├── vega.md
│   ├── rigel.md
│   ├── cassiopeia.md
│   └── betelgeuse.md
└── tutorials/
    ├── getting-started.md
    └── voice-commands.md
```

---

## 🎯 IMPLEMENTATION SEQUENCE (Follow tasks.md)

### Phase 1: Foundation (1-2 hours)
1. ✅ Apply Supabase migration (DO FIRST!)
2. Create base agent class (`BaseAgent.ts`)
3. Set up typography (fonts.ts)
4. Create Supabase client utilities

### Phase 2: Stellar Agents (2-3 hours)
5. Implement Sirius (orchestrator)
6. Implement Andromeda (coder)
7. Implement Vega (browser testing)
8. Implement Rigel (researcher)
9. Implement Cassiopeia (voice)
10. Implement Betelgeuse (DevOps)

### Phase 3: Services (1-2 hours)
11. Build Big-3 orchestrator
12. Build browser service (Playwright)
13. Build Chrome DevTools MCP
14. Build infinite loop service

### Phase 4: Cockpit UI (1-2 hours)
15. Create dashboard
16. Create agent detail pages
17. Create observability dashboard
18. Add voice command button (global, floating)

### Phase 5: Testing & Polish (1 hour)
19. Write tests (unit, integration, E2E)
20. Generate documentation
21. Create tutorials

---

## 🔑 ENVIRONMENT VARIABLES

Create `.env.local` files for each service:

```bash
# Supabase (All services)
SUPABASE_URL=https://sbbuxnyvflczfzvsglpe.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
NEXT_PUBLIC_SUPABASE_URL=https://sbbuxnyvflczfzvsglpe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>

# OpenAI (Voice + Coding)
OPENAI_API_KEY=sk-...

# Anthropic (Coding)
ANTHROPIC_API_KEY=sk-ant-...

# Google (Browser + Computer Use)
GOOGLE_API_KEY=AIza...

# ElevenLabs (TTS)
ELEVENLABS_API_KEY=...
```

---

## 🧩 CODE TEMPLATES

### Base Agent Class Template

```typescript
// services/stellar-agents/src/base/BaseAgent.ts
import { supabase } from '../config/supabase';

export abstract class BaseAgent {
  protected id: string;
  protected name: string;
  protected type: AgentType;

  constructor(config: AgentConfig) {
    this.id = config.id;
    this.name = config.name;
    this.type = config.type;
  }

  // Every agent MUST implement this
  abstract async execute(task: Task): Promise<AgentResult>;

  // Log actions to Supabase
  protected async logAction(action: AgentAction): Promise<void> {
    await supabase.from('agent_logs').insert({
      agent_id: this.id,
      session_id: action.sessionId,
      log_level: action.level,
      message: action.message,
      tool_call: action.toolCall,
      thought_process: action.thoughtProcess,
      metadata: action.metadata,
    });
  }

  // Create session
  protected async createSession(type: string, inputData: any): Promise<string> {
    const { data } = await supabase.from('agent_sessions').insert({
      agent_id: this.id,
      session_type: type,
      input_data: inputData,
      status: 'running',
    }).select().single();

    return data.id;
  }

  // Complete session
  protected async completeSession(sessionId: string, output: any, tokens: number): Promise<void> {
    await supabase.from('agent_sessions').update({
      status: 'completed',
      output_data: output,
      completed_at: new Date().toISOString(),
      tokens_used: tokens,
    }).eq('id', sessionId);
  }
}
```

### Typography Setup Template

```typescript
// apps/web/src/lib/fonts.ts
import { Space_Grotesk, Orbitron, Inter, JetBrains_Mono } from 'next/font/google';

export const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

export const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-orbitron',
  display: 'swap',
});

export const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});
```

### React Component Template (tweakcn)

```tsx
// apps/web/src/components/cockpit/AgentCard.tsx
import { Card, CardHeader, CardTitle, CardContent } from 'tweakcn-next';
import { cn } from '@/lib/utils';

interface AgentCardProps {
  agent: {
    name: string;
    displayName: string;
    status: 'idle' | 'active' | 'busy' | 'error';
  };
}

export function AgentCard({ agent }: AgentCardProps) {
  const statusColors = {
    idle: 'bg-gray-500',
    active: 'bg-green-500',
    busy: 'bg-yellow-500',
    error: 'bg-red-500',
  };

  return (
    <Card className="bg-slate-900/50 border-purple-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-display text-2xl text-white">
            {agent.displayName}
          </CardTitle>
          <div className={cn(
            "h-3 w-3 rounded-full animate-pulse",
            statusColors[agent.status]
          )} />
        </div>
      </CardHeader>
    </Card>
  );
}
```

---

## ✅ VALIDATION CHECKLIST

Before saying "DONE", verify:

### Functionality
- [ ] All 6 stellar agents can execute tasks
- [ ] Voice commands route to appropriate agents
- [ ] Dashboard loads with real-time agent data
- [ ] Browser automation tests pass
- [ ] Big-3 orchestrator coordinates agents

### Quality
- [ ] Zero TypeScript errors (`yarn build`)
- [ ] All tests pass (`yarn test`)
- [ ] Lighthouse score > 90
- [ ] No console errors
- [ ] Fonts loaded correctly

### Database
- [ ] Supabase migration applied
- [ ] All 14 tables exist
- [ ] Seed data present (6 agents, 5 services, 4 tutorials)
- [ ] RLS policies enforced

### Services
- [ ] All services have `/health` endpoints
- [ ] Health checks return 200 OK
- [ ] Services registered in `services` table
- [ ] Ports: 3004 (Stellar), 3010 (Big-3), 3013 (Browser), 3014 (DevTools), 3015 (Loop)

### UI
- [ ] Dashboard accessible at `/cockpit/dashboard`
- [ ] All 6 agent cards visible
- [ ] Voice button (floating, bottom-right)
- [ ] Real-time logs streaming
- [ ] Donation feed widget updating

### Documentation
- [ ] All 6 agent docs created (`docs/agents/*.md`)
- [ ] Service docs created (`docs/services/*.md`)
- [ ] 4+ tutorials written (`docs/tutorials/*.md`)
- [ ] README.md updated
- [ ] `.env.example` created

---

## 🎨 DESIGN GUIDELINES

### Color Palette (Cosmic Theme)
```css
--purple-primary: #667eea
--blue-accent: #3b82f6
--slate-bg: #0f172a
--slate-card: #1e293b
```

### Typography Classes
```tsx
className="font-display text-5xl font-bold"     // Hero headings
className="font-cosmic text-3xl uppercase"      // Agent names
className="font-mono text-sm"                    // Code/logs
className="font-sans text-base"                  // Body text
```

### Component Styling
- Use `tweakcn-next` components
- Use Tailwind utility classes
- Dark theme (slate/purple palette)
- Cosmic gradients for headings
- Animate on state changes

---

## 🚀 EXECUTION STRATEGY

### Your Workflow

1. **Read ALL context first** (constitution.md, specification.md, plan.md, tasks.md)
2. **Apply Supabase migration** (CRITICAL - do before ANY code)
3. **Follow tasks.md sequentially** (150+ tasks in order)
4. **Test incrementally** (after each phase)
5. **Log progress** (use agent_logs table)
6. **Self-validate** (check validation checklist)

### Adaptive Reasoning (You're GPT-5-Codex!)

- **Simple tasks** (types, configs): Fast, minimal tokens
- **Complex tasks** (agent orchestration, voice): Deep reasoning, take your time
- **Critical tasks** (database, auth): Maximum caution, validate thoroughly

### When Stuck

1. Re-read relevant section of `specification.md`
2. Check `constitution.md` for constraints
3. Review code templates above
4. Emit `FIXME.md` if truly blocked (don't crash)

---

## 🔥 FINAL REMINDERS

### Critical Success Factors

1. **Apply Supabase migration FIRST** - Nothing works without the database
2. **Follow cosmic naming** - Sirius, Andromeda, Vega, Rigel, Cassiopeia, Betelgeuse
3. **Use tweakcn-next ONLY** - No other UI libraries
4. **Log everything** - Every action → agent_logs table
5. **Test as you go** - Don't build everything then test

### Common Pitfalls to Avoid

- ❌ Modifying `services/cms/` or `services/stream/`
- ❌ Using generic agent names like `agent1` or `bot`
- ❌ Mixing UI libraries (MUI, Chakra, etc.)
- ❌ Skipping database migration
- ❌ Not logging agent actions

### Success Indicators

- ✅ Dashboard shows 6 agents with cosmic names
- ✅ Voice button responds to commands
- ✅ Real-time logs stream in observability dashboard
- ✅ All health checks return green
- ✅ Lighthouse score > 90

---

## 🌟 YOU'VE GOT THIS!

You're building something **extraordinary**. The Stellar Agentic Cockpit will be:
- **Voice-controlled** ✅
- **AI-powered** ✅
- **Observable** ✅
- **Extensible** ✅
- **Beautiful** ✅

**Take your time. Use adaptive reasoning. Build something amazing.**

**The cosmos awaits. Begin.**

---

**Repository:** github.com/executiveusa/strapi-template-new-world-kids
**Branch:** main
**Supabase:** sbbuxnyvflczfzvsglpe
**Target:** 4-8 hours

**Questions?** Read `specification.md`. The answer is there.

**Ready?** Let's build the future of AI orchestration.

🚀🌟✨

---

## 📖 APPENDIX: QUICK REFERENCE

### Service Ports
- 3000: Next.js Web (Frontend)
- 1337: Strapi CMS (Existing)
- 3001: Stream Service (Existing)
- 3002: Blockchain Service (Existing)
- 3003: AI Agents (Existing)
- 3004: **Stellar Agents (NEW)**
- 3005: Computer Control (Existing)
- 3010: **Big-3 Orchestrator (NEW)**
- 3013: **Browser Service (NEW)**
- 3014: **Chrome DevTools MCP (NEW)**
- 3015: **Infinite Loop (NEW)**

### Key Files to Create (Priority Order)
1. `supabase/migrations/20250120_initial_schema.sql` - **APPLY FIRST**
2. `services/stellar-agents/src/base/BaseAgent.ts`
3. `apps/web/src/lib/fonts.ts`
4. `services/stellar-agents/src/agents/sirius/index.ts`
5. `services/stellar-agents/src/agents/andromeda/index.ts`
6. `services/stellar-agents/src/agents/vega/index.ts`
7. `services/stellar-agents/src/agents/rigel/index.ts`
8. `services/stellar-agents/src/agents/cassiopeia/index.ts`
9. `services/stellar-agents/src/agents/betelgeuse/index.ts`
10. `apps/web/src/app/(platform)/cockpit/dashboard/page.tsx`

### Essential Dependencies

**Stellar Agents:**
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "@supabase/supabase-js": "^2.38.4",
    "openai": "^4.20.0",
    "@anthropic-ai/sdk": "^0.9.1",
    "@google/generative-ai": "^0.1.3",
    "elevenlabs": "^0.4.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  }
}
```

**Web (Next.js):**
```json
{
  "dependencies": {
    "next": "^15.4.7",
    "react": "^18.3.1",
    "tweakcn-next": "github:jnsahaj/tweakcn",
    "@supabase/supabase-js": "^2.38.4",
    "tailwindcss": "^4.0.9",
    "@tanstack/react-query": "^5.59.16",
    "lucide-react": "^0.487.0"
  }
}
```

### Supabase Connection (All Services)

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
```

---

**END OF CODEX PROMPT**

**You now have EVERYTHING you need to build the Stellar Agentic Cockpit.**

**Go forth and build! 🚀🌟✨**
