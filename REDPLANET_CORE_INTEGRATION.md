# 🚀 REDPLANET CORE - AI MEMORY LAYER FOR NEW WORLD KIDS

**Status:** ✅ Cloned and Configured
**Purpose:** Unified, Persistent Memory for All Your AI Agents
**Location:** `services/redplanet-core/`

---

## 🤯 WHAT IS REDPLANET CORE?

**Problem You Had:**
- AI agents forget everything between sessions
- Switch from ChatGPT to Claude → lose all context
- Hit token limits → start fresh, lose everything
- Every new AI tool requires re-explaining your nonprofit's mission

**RedPlanet CORE Solution:**
**CORE = Contextual Observation & Recall Engine**

It's like giving your AI agents a **permanent brain** that remembers:
- ✅ Who said what, when, and why
- ✅ Your nonprofit's mission and projects
- ✅ Conversations across ALL AI tools
- ✅ Decisions, preferences, and insights
- ✅ Full context that follows you everywhere

---

## 🌟 KEY FEATURES

### **1. Unified Memory Across AI Tools**
Your 6 stellar agents (Sirius, Andromeda, Vega, etc.) can now share memory!
- Sirius plans a campaign → Andromeda remembers the plan when building it
- Vega tests a feature → Rigel remembers the test results when researching improvements
- **One knowledge graph for ALL agents**

### **2. Temporal Knowledge Graph**
Not just flat storage - CORE tracks:
- **Who** said it (which agent, which user)
- **When** it was said (timestamps, evolution over time)
- **Why** it was said (context, relationships)
- **How** it connects to other facts

**Example:**
```
Statement: "New World Kids focuses on food forests"
  ↓
Entity: "New World Kids"
Entity: "Food forests"
Relationship: "focuses on"
Source: "Indigo Azul project description"
Time: "2025-01-22"
Speaker: "Trevor (founder)"
Connected to: "Season 4", "Puerto Vallarta", "500+ trees"
```

### **3. Auto-Sync from Apps**
Automatically captures context from:
- ✅ Linear (project management)
- ✅ Slack (team discussions)
- ✅ GitHub (code context)
- ✅ Notion (documentation)
- ✅ Your AI agents' conversations

### **4. Browser Extension**
Save conversations from:
- ChatGPT, Claude, Gemini
- Twitter, YouTube
- Blog posts, articles
- **Any webpage** → Instant memory

### **5. Chat with Memory**
Ask questions like:
- "What are New World Kids' current projects?"
- "What did we decide about the fundraising campaign?"
- "Who are our Seattle partners?"
- "What's the status of Culture Shock Sports?"

### **6. MCP Integration**
Connect once, use everywhere:
- Claude Desktop
- Cursor
- Claude Code
- Windsurf
- VS Code
- Any MCP-compatible tool

---

## 🏗️ ARCHITECTURE

```
┌─────────────────────────────────────────────────┐
│  NEW WORLD KIDS AI AGENTS                        │
│  (Sirius, Andromeda, Vega, Rigel, Cassiopeia,  │
│   Betelgeuse)                                    │
└───────────────┬─────────────────────────────────┘
                │
                ↓ (MCP Protocol)
┌─────────────────────────────────────────────────┐
│  REDPLANET CORE (Memory Layer)                   │
│  ┌─────────────────────────────────────────┐   │
│  │  Web App (Port 3033)                     │   │
│  │  - Dashboard                             │   │
│  │  - Memory Graph Visualization            │   │
│  │  - Chat Interface                        │   │
│  └─────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────┐   │
│  │  Knowledge Graph (Neo4j)                 │   │
│  │  - Entities                              │   │
│  │  - Statements                            │   │
│  │  - Episodes                              │   │
│  │  - Relationships                         │   │
│  └─────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────┐   │
│  │  PostgreSQL Database                     │   │
│  │  - User data                             │   │
│  │  - Sessions                              │   │
│  │  - Integrations                          │   │
│  └─────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────┐   │
│  │  Redis Cache                             │   │
│  │  - Fast lookups                          │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
                │
                ↓
┌─────────────────────────────────────────────────┐
│  INTEGRATIONS                                    │
│  - Linear, Slack, GitHub, Notion                │
│  - Browser Extension                             │
│  - Claude, Cursor, VS Code (MCP)                │
└─────────────────────────────────────────────────┘
```

---

## 🚀 SETUP INSTRUCTIONS

### **Prerequisites:**
- ✅ Docker & Docker Compose installed (you have v28.3.2!)
- ✅ OpenAI API key
- ✅ ~4GB RAM available for containers

### **Step 1: Configure Environment**
```bash
# File already created at: services/redplanet-core/.env
# Update these values:

OPENAI_API_KEY=sk-proj-YOUR_OPENAI_KEY_HERE

# Keep defaults for local development:
# - Port 3033 for web app
# - PostgreSQL, Neo4j, Redis in Docker
# - All passwords use the default (change in production!)
```

### **Step 2: Start CORE Services**
```bash
cd services/redplanet-core

# Start all services (PostgreSQL, Neo4j, Redis, Web App)
docker-compose up -d

# This starts:
# - PostgreSQL (database)
# - Neo4j (knowledge graph)
# - Redis (cache)
# - CORE Web App (dashboard)

# Wait ~30 seconds for services to initialize
```

### **Step 3: Verify It's Running**
```bash
# Check all containers are healthy
docker-compose ps

# Should see 4 running containers:
# - redplanet-core-postgres
# - redplanet-core-neo4j
# - redplanet-core-redis
# - redplanet-core-webapp

# Visit the dashboard
# http://localhost:3033
```

### **Step 4: Create Your Account**
1. Open http://localhost:3033
2. Sign up with email (magic link)
3. Check your email for login link
4. You're in!

### **Step 5: Visualize Your Knowledge Graph**
1. In the dashboard, click "Memory Graph"
2. See entities, statements, and relationships
3. Watch it grow as you add memories!

---

## 🧠 HOW CORE CREATES MEMORY

### **4-Phase Ingestion Pipeline:**

**1. Normalization**
- Links new info to recent context
- Breaks long docs into chunks
- Standardizes terms
- **Example:** "NWK" → "New World Kids"

**2. Extraction**
- Identifies entities (people, projects, concepts)
- Creates statements with context
- Maps relationships
- **Example:** "We focus on food forests" →
  - Entities: ["New World Kids", "food forests"]
  - Statement: "New World Kids focuses on food forests"
  - Relationship: "focuses on"

**3. Resolution**
- Detects contradictions
- Tracks how things evolve
- Preserves multiple perspectives
- **Example:** "Culture Shock Sports is building" (Jan 2025)
  vs. "Culture Shock Sports is active" (Future)
  → Both preserved with timestamps!

**4. Graph Integration**
- Connects entities, statements, episodes
- Builds temporal knowledge graph
- Links facts to context and history
- **Result:** Living web of knowledge

---

## 🔍 HOW CORE RECALLS MEMORY

### **When You Ask a Question:**

**1. Search (Multi-Angle)**
- Keyword search (exact matches)
- Semantic search (related ideas)
- Graph traversal (connected concepts)

**2. Re-Rank**
- Orders by relevance
- Ensures diversity
- Surfaces deeper connections

**3. Filtering**
- By time (recent vs. historical)
- By reliability (source quality)
- By relationship strength

**4. Output**
- Facts (clear statements)
- Episodes (original context)
- **Always grounded in time and story**

---

## 🔗 INTEGRATION WITH NEW WORLD KIDS AGENTS

### **Connect Your Stellar Agents to CORE:**

**1. Get Your CORE API Key**
```bash
# In CORE dashboard (http://localhost:3033)
# Go to: Settings → API Keys → Generate New Key
# Name it: "new-world-kids-agents"
# Copy the key
```

**2. Update Agent Configuration**
```typescript
// services/stellar-agents/src/config/memory.ts
import { CoreMemoryClient } from '@redplanet/sdk';

const memory = new CoreMemoryClient({
  apiKey: process.env.CORE_API_KEY,
  baseUrl: 'http://localhost:3033/api',
});

// Store agent context
export async function storeAgentContext(agent: string, context: any) {
  await memory.store({
    entity: agent,
    statement: JSON.stringify(context),
    source: 'stellar-agent',
    timestamp: new Date().toISOString(),
  });
}

// Recall agent context
export async function recallAgentContext(query: string) {
  const results = await memory.recall({
    query,
    limit: 10,
  });
  return results;
}
```

**3. Enhance Sirius (Orchestrator) with Memory**
```typescript
// services/stellar-agents/src/agents/sirius/index.ts
import { storeAgentContext, recallAgentContext } from '../../config/memory';

export class SiriusAgent extends BaseAgent {
  async execute(task: Task) {
    // BEFORE planning - recall relevant context
    const context = await recallAgentContext(
      `What do we know about ${task.description}?`
    );

    // Use context in planning
    const plan = await this.plan(task, context);

    // AFTER planning - store the plan
    await storeAgentContext('Sirius', {
      task: task.description,
      plan: plan,
      timestamp: new Date().toISOString(),
    });

    return plan;
  }
}
```

### **Benefits You Get:**

**Sirius remembers previous plans:**
- "We already planned a similar campaign last month - here's what worked"

**Andromeda remembers code patterns:**
- "Last time we built a donation page, we used Stripe integration like this..."

**Vega remembers test results:**
- "This bug was fixed before - the solution was..."

**Rigel remembers research:**
- "We already researched Seattle grants - here are the top 5"

**Cassiopeia remembers communications:**
- "Here's how we explained our mission to donors before"

**Betelgeuse remembers deployments:**
- "Last deployment had issues with CORS - here's the fix"

---

## 💡 USE CASES FOR NEW WORLD KIDS

### **1. Onboarding New Volunteers**
**Before:** Explain mission every time
**After:** CORE remembers:
- Mission: "Food, water, energy, shelter for 7 generations"
- Projects: Indigo Azul, Culture Shock, etc.
- Status: What's active vs. building
- **New volunteer asks:** "What do you do?"
- **AI responds with full context!**

### **2. Grant Applications**
**Before:** Research grants every time
**After:** CORE remembers:
- Previous grant research
- Grant deadlines
- Application requirements
- Success/failure patterns
- **Rigel:** "Here are 5 new grants + what we learned from last applications"

### **3. Donor Communications**
**Before:** Recreate impact stories each time
**After:** CORE remembers:
- Donation history
- Impact metrics evolution
- Donor preferences
- Previous communications
- **Cassiopeia:** "Here's an updated impact story with latest numbers"

### **4. Project Planning**
**Before:** Start from scratch
**After:** CORE remembers:
- Similar past projects
- What worked/didn't work
- Team decisions
- Resource needs
- **Sirius:** "Based on Indigo Azul Season 3, here's the plan for Season 5"

### **5. Technical Troubleshooting**
**Before:** Debug same issues repeatedly
**After:** CORE remembers:
- Previous bugs and fixes
- Deployment issues
- Configuration changes
- **Betelgeuse:** "This deployment error happened before - here's the fix"

---

## 🔒 SECURITY & PRIVACY

### **What CORE Stores:**
✅ Conversation history
✅ User preferences
✅ Task context
✅ Reference materials
✅ Project decisions

### **What CORE Doesn't Store:**
❌ Sensitive PII (unless you explicitly add it)
❌ Credentials or API keys
❌ System logs
❌ Temporary cache data

### **Security Features:**
- **Encryption:** TLS 1.3 in transit, AES-256 at rest
- **Authentication:** OAuth 2.0 + magic links
- **Access Control:** Workspace-based isolation
- **Self-Hosted:** Your data stays on your infrastructure

---

## 📊 MONITORING & MAINTENANCE

### **Check Service Health:**
```bash
# View logs
docker-compose logs -f

# Check specific service
docker-compose logs webapp
docker-compose logs neo4j
docker-compose logs postgres

# Restart a service
docker-compose restart webapp

# Stop all services
docker-compose down

# Start again
docker-compose up -d
```

### **Backup Your Memory:**
```bash
# Backup Neo4j graph database
docker exec redplanet-core-neo4j neo4j-admin dump --to=/backups/neo4j-$(date +%Y%m%d).dump

# Backup PostgreSQL
docker exec redplanet-core-postgres pg_dump -U docker core > backup-$(date +%Y%m%d).sql
```

---

## 🎯 NEXT STEPS

### **Phase 1: Basic Setup** (Today)
- [x] Clone RedPlanet CORE
- [x] Configure environment
- [ ] Add OpenAI API key
- [ ] Start Docker services
- [ ] Create account
- [ ] Explore dashboard

### **Phase 2: Agent Integration** (This Week)
- [ ] Install CORE SDK in agents
- [ ] Connect Sirius to CORE
- [ ] Connect Andromeda to CORE
- [ ] Test memory recall
- [ ] Document patterns

### **Phase 3: Team Adoption** (Next Week)
- [ ] Train volunteers on CORE
- [ ] Add project context manually
- [ ] Install browser extension
- [ ] Connect Linear/Slack
- [ ] Build knowledge graph

### **Phase 4: Advanced** (Next Month)
- [ ] Custom integrations
- [ ] Automated sync from Supabase
- [ ] Impact metrics in CORE
- [ ] Donor relationship tracking
- [ ] Full organizational memory

---

## 🌟 WHY THIS IS GAME-CHANGING FOR NEW WORLD KIDS

### **Before CORE:**
- AI agents forget everything
- Repeat explanations constantly
- Lose context between tools
- No organizational memory
- Start from scratch every session

### **After CORE:**
- **Persistent memory** across all agents
- **One explanation** → Remembered forever
- **Context follows you** everywhere
- **Organizational brain** that grows
- **7 generations of knowledge!**

---

## 📚 RESOURCES

**Documentation:**
- Official Docs: https://docs.heysol.ai
- API Reference: https://docs.heysol.ai/api-reference
- MCP Integration: https://docs.heysol.ai/providers/claude-code

**Community:**
- Discord: https://discord.gg/YGUZcvDjUa
- GitHub: https://github.com/RedPlanetHQ/core

**Support:**
- Email: manik@poozle.dev
- Issues: https://github.com/RedPlanetHQ/core/issues

---

## ✅ READY TO USE!

**Status:** Configured and ready to start

**To Start:**
1. Add your OpenAI API key to `.env`
2. Run `docker-compose up -d`
3. Visit http://localhost:3033
4. Create account
5. Start building your memory!

**Your nonprofit now has a PERMANENT BRAIN! 🧠✨**

This means your AI agents will remember:
- ✅ Your mission for 7 generations
- ✅ All 4 projects and their status
- ✅ Every donor conversation
- ✅ Every decision made
- ✅ Every lesson learned

**Building for 7 generations just got a whole lot easier! 🌍🚀**
