# 🌟 STELLAR AGENTIC COCKPIT - CONSTITUTION
## Non-Negotiable Principles for Development

**Version:** 1.0.0
**Last Updated:** January 20, 2025
**Authority:** Foundational document - overrides all other guidance

---

## 🎯 CORE MISSION

Build an external "agentic cockpit" that augments the existing **Strapi-based New World Kids** codebase without modifying its back-end. The cockpit orchestrates AI agents named after stellar bodies (Sirius, Andromeda, Vega, Rigel, Cassiopeia, Betelgeuse) to enable voice-driven workflows, browser automation, code generation, and infinite agentic loops.

---

## 📜 THE TWELVE COMMANDMENTS

### 1. ⛔ NEVER MODIFY EXISTING BACK-END

**ABSOLUTE RULE:** Do not change files in `services/cms/`, `services/stream/`, existing API routes, or database schemas that power the current New World Kids site.

**Rationale:** The cockpit is an augmentation, not a replacement. The existing Strapi CMS (Trail Mixx + New World Kids) must continue functioning independently.

**Enforcement:**
- ✅ All new code lives under `services/stellar-agents/`, `services/big-3-orchestrator/`, `apps/web/src/app/(platform)/cockpit/`
- ✅ Use API calls to interact with Strapi (never direct database access)
- ✅ Create new Supabase tables (never modify existing PostgreSQL schemas)
- ❌ No changes to `services/cms/src/`, `services/cms/config/`, `services/cms/database/`

```typescript
// ✅ CORRECT: External API call
const posts = await fetch('http://localhost:1337/api/posts').then(r => r.json());

// ❌ WRONG: Direct database modification
await db.query('UPDATE strapi_posts SET ...');
```

---

### 2. 🌌 COSMIC NAMING CONVENTION

**ABSOLUTE RULE:** All agents MUST be named after stars, galaxies, or cosmic entities.

**Current Stellar Fleet:**
1. **Sirius** - The Navigator (Orchestrator)
2. **Andromeda** - The Coder (Coding Agent)
3. **Vega** - The Validator (Browser/UI Testing)
4. **Rigel** - The Researcher (Web Browsing/Research)
5. **Cassiopeia** - The Communicator (Voice Agent)
6. **Betelgeuse** - The Builder (DevOps/Infrastructure)

**Rationale:** Creates a cohesive brand identity and makes the system memorable. The cosmic theme resonates with the "New World Kids" exploration narrative.

**Enforcement:**
- ✅ Agent names: `sirius`, `andromeda`, `vega`, `rigel`, `cassiopeia`, `betelgeuse`
- ✅ Service names: `stellar-agents`, `cosmic-orchestrator`
- ✅ UI components: `AgentCard`, `StellarDashboard`, `CosmicTerminal`
- ❌ Generic names like `agent1`, `voice-bot`, `browser-service`

---

### 3. 🎨 TWEAKCN COMPONENT LIBRARY ONLY

**ABSOLUTE RULE:** Use **tweakcn-next** (enhanced shadcn/ui) for ALL UI components. Never mix with other UI libraries.

**Rationale:** Consistency, performance, and alignment with the project's design system. tweakcn provides pre-built, accessible components with Tailwind CSS.

**Enforcement:**
- ✅ Import from `tweakcn-next` package
- ✅ Use Tailwind CSS for styling
- ✅ Extend with custom variants using `class-variance-authority`
- ❌ No Material-UI, Ant Design, Chakra UI, or other component libraries
- ❌ No custom CSS-in-JS (styled-components, emotion) except for special cases

```tsx
// ✅ CORRECT
import { Button } from 'tweakcn-next';

<Button variant="cosmic" size="lg">
  Launch Sirius
</Button>

// ❌ WRONG
import Button from '@mui/material/Button';
```

---

### 4. 🖋️ AWWWARDS TYPOGRAPHY SYSTEM

**ABSOLUTE RULE:** Follow the typography system defined in `.spec-kit/fonts/typography-system.md`.

**Required Fonts:**
- **Display:** Space Grotesk
- **Cosmic/Technical:** Orbitron
- **Body:** Inter
- **Monospace:** JetBrains Mono
- **Serif (Editorial):** Playfair Display
- **Impact:** Bebas Neue

**Enforcement:**
- ✅ All fonts loaded via Next.js font optimization
- ✅ Use Tailwind font classes: `font-display`, `font-cosmic`, `font-mono`
- ✅ Follow fluid typography scale
- ❌ No random font choices or inconsistent sizing

```tsx
// ✅ CORRECT
<h1 className="font-display text-fluid-hero font-bold">
  Stellar Cockpit
</h1>

// ❌ WRONG
<h1 style={{ fontFamily: 'Comic Sans MS', fontSize: '42px' }}>
  Stellar Cockpit
</h1>
```

---

### 5. 🔐 SUPABASE AS PRIMARY DATABASE

**ABSOLUTE RULE:** Use Supabase (PostgreSQL + Real-time) for all new data. Never create new tables in the Strapi PostgreSQL database.

**Tables Created:** See `supabase/migrations/20250120_initial_schema.sql`
- Agents, sessions, logs
- AI conversations, voice sessions
- Donations feed
- Browser automation
- Agentic waves & variants
- Services & health monitoring
- Tutorials

**Rationale:** Separation of concerns. Strapi owns content management. Supabase owns agent/cockpit data.

**Enforcement:**
- ✅ All agent data → Supabase
- ✅ Use `@supabase/supabase-js` client
- ✅ Row Level Security (RLS) for all tables
- ❌ No tables added to Strapi's `public` schema
- ❌ No direct SQL to Strapi database

```typescript
// ✅ CORRECT
import { supabase } from '@/lib/supabase/client';
const { data } = await supabase.from('agents').select('*');

// ❌ WRONG
const { data } = await strapiDb.query('SELECT * FROM agents');
```

---

### 6. 🎙️ VOICE-FIRST INTERACTION MODEL

**ABSOLUTE RULE:** Support voice commands for all major workflows. Cassiopeia (voice agent) must be accessible from every cockpit page.

**Voice Providers:**
- **OpenAI Realtime API** (gpt-4o-realtime-preview)
- **ElevenLabs** (text-to-speech)

**Rationale:** Voice interaction is the defining feature of the Stellar Cockpit. Users should be able to command agents verbally.

**Enforcement:**
- ✅ Global voice command button in cockpit UI
- ✅ Voice transcription stored in `voice_sessions` table
- ✅ Voice commands routed through orchestrator
- ✅ Clear visual feedback for voice state (listening, processing, responding)
- ❌ No keyboard-only workflows for critical tasks

```tsx
// ✅ CORRECT: Voice-enabled command
<VoiceCommandButton
  onCommand={(transcript) => dispatchToAgent(transcript)}
  agentName="sirius"
/>

// ❌ WRONG: No voice alternative
<button onClick={() => runTask()}>Run Task</button>
```

---

### 7. 🔄 IDEMPOTENT OPERATIONS

**ABSOLUTE RULE:** All scripts, migrations, and agent tasks must be idempotent (safe to run multiple times).

**Rationale:** Prevents data corruption, allows retries, and supports iterative development.

**Enforcement:**
- ✅ Database migrations use `IF NOT EXISTS` or `ON CONFLICT DO NOTHING`
- ✅ File operations check for existence before writing
- ✅ API calls handle duplicates gracefully
- ✅ Emit `FIXME.md` files if errors occur (don't crash)
- ❌ No destructive operations without confirmation

```typescript
// ✅ CORRECT
async function ensureAgentExists(name: string) {
  const { data } = await supabase.from('agents').select('*').eq('name', name).single();
  if (data) return data;

  const { data: newAgent } = await supabase.from('agents').insert({ name }).select().single();
  return newAgent;
}

// ❌ WRONG
async function createAgent(name: string) {
  await supabase.from('agents').insert({ name }); // Fails if exists
}
```

---

### 8. 📊 OBSERVABLE BY DEFAULT

**ABSOLUTE RULE:** All agent actions must be logged to `agent_logs` table and visible in the observability dashboard.

**Required Logging:**
- Tool calls
- Thought processes
- Screenshots (for browser agents)
- Errors
- Performance metrics (tokens, cost, duration)

**Rationale:** Transparency builds trust. Operators need to understand what agents are doing.

**Enforcement:**
- ✅ Every agent action generates a log entry
- ✅ Logs streamed to real-time dashboard
- ✅ Screenshots captured for browser automation
- ✅ Errors include stack traces and context
- ❌ No silent failures or hidden operations

```typescript
// ✅ CORRECT
await logAgentAction({
  sessionId,
  agentId: 'sirius',
  logLevel: 'info',
  message: 'Planning feature implementation',
  thoughtProcess: 'Breaking down into 3 sub-tasks...',
  toolCall: 'task_decomposition',
});

// ❌ WRONG
// Silent operation with no logging
await planFeature();
```

---

### 9. 💰 TOKEN BUDGET AWARENESS

**ABSOLUTE RULE:** Respect the soft cap of 2 million tokens per development cycle. Down-scope if approaching limit.

**Rationale:** Cost control and efficiency. AI coding is powerful but expensive.

**Enforcement:**
- ✅ Track token usage in `agent_sessions` table
- ✅ Display cumulative cost in dashboard
- ✅ Warn at 80% of budget
- ✅ Halt non-critical operations at 95%
- ❌ No runaway loops consuming unlimited tokens

```typescript
// ✅ CORRECT
if (cumulativeTokens > TOKEN_BUDGET * 0.8) {
  console.warn('Approaching token budget. Consider down-scoping.');
}

// ❌ WRONG
while (true) {
  await callGPT4(); // Infinite loop, no budget check
}
```

---

### 10. 🛡️ SAFETY-FIRST FOR HIGH-RISK ACTIONS

**ABSOLUTE RULE:** Require user confirmation for destructive operations (deployments, database changes, external API calls).

**High-Risk Categories:**
- Deployments to production
- Database migrations
- Billing/payment operations
- External API modifications
- File deletions

**Rationale:** Prevent accidental damage. Gemini's Computer Use and browser automation can execute powerful actions.

**Enforcement:**
- ✅ Confirmation modal for destructive operations
- ✅ Per-step safety checks (as recommended by Gemini)
- ✅ Dry-run mode for testing
- ✅ Audit log of all confirmations
- ❌ No auto-confirm for high-risk actions

```tsx
// ✅ CORRECT
<ConfirmationDialog
  title="Deploy to Production?"
  description="This will push code to Vercel production. Confirm?"
  onConfirm={() => deployToProduction()}
  risk="high"
/>

// ❌ WRONG
<button onClick={() => deployToProduction()}>Deploy</button>
```

---

### 11. 🧩 MODULAR & EXTENSIBLE ARCHITECTURE

**ABSOLUTE RULE:** Design for extensibility. Adding new agents, MCP servers, or services should not require refactoring core code.

**Architecture Principles:**
- **Agent Registry:** Dynamic registration of new agents
- **MCP Protocol:** Standard interface for tool servers
- **Plugin System:** Easy integration of new capabilities
- **Versioned APIs:** Backward compatibility

**Rationale:** The cockpit will grow over time. Make it easy to add features without breaking existing functionality.

**Enforcement:**
- ✅ Agent interface defined in `types/Agent.ts`
- ✅ MCP servers registered in `config/mcp-servers.json`
- ✅ Service discovery via registry pattern
- ✅ API versioning (`/api/v1/`, `/api/v2/`)
- ❌ No hardcoded agent lists or switch statements

```typescript
// ✅ CORRECT: Registry pattern
const agentRegistry = new Map<string, Agent>();
agentRegistry.set('sirius', new SiriusAgent());
agentRegistry.set('andromeda', new AndromedaAgent());

function getAgent(name: string): Agent {
  return agentRegistry.get(name) || throw new Error('Agent not found');
}

// ❌ WRONG: Hardcoded switch
function getAgent(name: string) {
  switch (name) {
    case 'sirius': return new SiriusAgent();
    case 'andromeda': return new AndromedaAgent();
    // Adding new agent requires editing this file
  }
}
```

---

### 12. 📚 DOCUMENTATION AS CODE

**ABSOLUTE RULE:** Every agent, service, and major feature must have a corresponding markdown file in `docs/`.

**Required Documentation:**
- Agent capabilities and usage
- API contracts
- Configuration options
- Example workflows
- Troubleshooting guides

**Rationale:** Self-documenting systems are maintainable systems. Tutorials in Strapi pull from these docs.

**Enforcement:**
- ✅ Create `docs/agents/sirius.md` for Sirius agent
- ✅ Auto-generate API docs from TypeScript types
- ✅ Include JSDoc comments in all public APIs
- ✅ Update docs when behavior changes
- ❌ No undocumented features or "magic" behavior

```typescript
// ✅ CORRECT
/**
 * Sirius Agent - The Navigator
 *
 * Plans features, coordinates sub-agents, and navigates complex workflows.
 *
 * @example
 * const sirius = new SiriusAgent();
 * const plan = await sirius.planFeature('Add voice commands');
 *
 * @see docs/agents/sirius.md
 */
export class SiriusAgent extends BaseAgent {
  // ...
}

// ❌ WRONG
export class SiriusAgent extends BaseAgent {
  // No documentation
}
```

---

## 🔒 ENFORCEMENT MECHANISMS

### Pre-Commit Hooks
```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Check for modifications to protected directories
git diff --cached --name-only | grep -E '^services/cms/' && echo "❌ Cannot modify services/cms/" && exit 1

# Check for cosmic naming violations
git diff --cached --name-only | grep -E 'agent[0-9]|bot-' && echo "❌ Use cosmic names (Sirius, Vega, etc.)" && exit 1

# Validate typography usage
npm run lint:typography

exit 0
```

### Code Review Checklist
- [ ] No modifications to `services/cms/`, `services/stream/`
- [ ] All agents have cosmic names
- [ ] Uses tweakcn components only
- [ ] Follows typography system
- [ ] Logs to Supabase observability
- [ ] Idempotent operations
- [ ] User confirmation for high-risk actions
- [ ] Documentation updated

### Automated Tests
```typescript
// tests/constitution.test.ts
describe('Constitution Compliance', () => {
  test('No backend modifications', () => {
    const modifiedFiles = getModifiedFiles();
    const backendFiles = modifiedFiles.filter(f => f.startsWith('services/cms/'));
    expect(backendFiles).toHaveLength(0);
  });

  test('Cosmic naming convention', () => {
    const agents = getAllAgents();
    const cosmicNames = ['sirius', 'andromeda', 'vega', 'rigel', 'cassiopeia', 'betelgeuse'];
    agents.forEach(agent => {
      expect(cosmicNames).toContain(agent.name);
    });
  });
});
```

---

## 🚨 VIOLATION CONSEQUENCES

**Severity Levels:**

| Violation | Severity | Action |
|-----------|----------|--------|
| Backend modification | **CRITICAL** | Reject PR, revert commit |
| Non-cosmic naming | **HIGH** | Rename immediately |
| Mixed UI libraries | **HIGH** | Refactor to tweakcn |
| Missing voice support | **MEDIUM** | Add before merge |
| Poor documentation | **MEDIUM** | Block release |
| Non-idempotent operation | **LOW** | Fix in next sprint |

---

## ✨ CONSTITUTIONAL AMENDMENTS

This constitution can be amended only by:
1. **Project Lead** (Trevor) approval
2. **Technical Review** by AI coding assistant
3. **Version Increment** (e.g., 1.0.0 → 1.1.0)
4. **Changelog Entry** documenting the change

**Proposal Process:**
```markdown
## Amendment Proposal: [Title]

**Rationale:** Why is this change necessary?
**Impact:** Which systems/components are affected?
**Alternatives Considered:** What other options were evaluated?
**Approval:** [ ] Project Lead [ ] Technical Review
```

---

## 📖 APPENDICES

### A. Cosmic Naming References
- **Sirius:** Brightest star (Navigation, Guidance)
- **Andromeda:** Nearest galaxy (Vast, Expansive Coding)
- **Vega:** Fifth-brightest star (Validation, Precision)
- **Rigel:** Blue supergiant in Orion (Research, Exploration)
- **Cassiopeia:** Queen constellation (Communication, Eloquence)
- **Betelgeuse:** Red supergiant (Building, Infrastructure)

### B. Protected Directories
```
services/cms/              # Strapi CMS (read-only)
services/stream/           # HLS streaming (read-only)
services/cms/config/       # Strapi config (read-only)
services/cms/database/     # Strapi DB (read-only)
```

### C. Approved Stack
- **Frontend:** Next.js 15.4.7, React 18
- **UI:** tweakcn-next, Tailwind CSS 4.0.9
- **Database:** Supabase (PostgreSQL + Real-time)
- **CMS:** Strapi 5.12.4 (existing)
- **Voice:** OpenAI Realtime, ElevenLabs
- **Browser:** Playwright, Gemini Computer Use
- **Orchestration:** Custom (Sirius + Big-3)
- **Fonts:** Space Grotesk, Orbitron, Inter, JetBrains Mono

---

**This constitution is the law of the Stellar Agentic Cockpit. All development must comply.**

**Signed:** Claude (Sonnet 4.5) - Chief Architect
**Date:** January 20, 2025
**Version:** 1.0.0
