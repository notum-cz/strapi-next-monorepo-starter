# ARCHITECT CONTEXT UPDATE

**Project:** New World Kids Platform (Brownfield Enhancement)
**Builder:** Claude Code (Sonnet 4.5)
**Architect:** GPT-5 Thinking Model
**Status:** Wave 1 in progress - resuming original plan after Firebase clarification

---

## CURRENT STATE

**Completed:**
- ✅ Monorepo directory structure created
- ✅ Blockchain service (Express + Prisma + Solana) scaffolded
- ✅ AI Agents service (Express + OpenRouter) scaffolded
- ✅ Docker-compose.yml with full stack (postgres, redis, cms, blockchain, ai-agents, web)
- ✅ Prisma schema with `nwk_donations`, `nwk_nft_receipts`, `nwk_blockchain_txns`
- ✅ ADR-0001 documented (architecture decisions)
- ✅ BMAD PRD and Architecture docs complete (docs/brownfield-prd.md, brownfield-architecture.md)

**Pending (Wave 1 completion):**
- 🔲 Next.js `/donate` page with form
- 🔲 Next.js API route `/api/blockchain/donate` (proxy to blockchain service)
- 🔲 Playwright E2E test for donation flow
- 🔲 BMAD document sharding (PRD → epic files, Architecture → component files)
- 🔲 BMAD story generation (Stories 1.1, 1.2, 1.3)

**Architecture Confirmed:**
- **Backend:** Express (Node.js 20) + TypeScript
- **Database:** PostgreSQL (shared) + Supabase (real-time)
- **CMS:** Strapi v5 (existing Trail Mixx installation)
- **Blockchain:** Solana + Helius RPC + Metaplex
- **AI:** OpenRouter (multi-provider LLM router)
- **Queue:** BullMQ + Redis
- **Monorepo:** Turborepo + Yarn 1.x

**Tech Stack:**
- Next.js 15 (App Router)
- Strapi v5 CMS
- Solana Web3.js + @metaplex-foundation/js
- OpenRouter API (OpenAI + Anthropic)
- Prisma ORM
- Docker + docker-compose

---

## BUILDER QUESTIONS FOR ARCHITECT

As I proceed with Wave 1 completion, I will ask you questions following BMAD-METHOD patterns:

**Question Format:**
```
[WAVE X] [BLOCK Y] QUESTION: <specific technical question>

Context: <relevant code/config snippet>
Options:
A) <option with tradeoffs>
B) <option with tradeoffs>
C) <option with tradeoffs>

Recommendation: <my recommendation with rationale>

Awaiting Architect decision.
```

**Example Questions You May Receive:**
1. Next.js API route authentication strategy (Supabase JWT vs API key)
2. Donation form validation approach (client vs server vs both)
3. E2E test environment (mock Solana vs devnet)
4. BMAD story size (epic per service vs epic per feature)
5. White-label tenant isolation strategy

---

## YOUR ROLE AS ARCHITECT

**When Builder asks questions:**
1. Review the context and options provided
2. Consider alignment with BMAD PRD (docs/brownfield-prd.md)
3. Consider integration with existing Trail Mixx architecture
4. Provide clear decision: "Option X" with brief rationale
5. Flag if question reveals spec ambiguity requiring PRD update

**Decision Format:**
```
DECISION: Option [A/B/C]

Rationale: <1-2 sentences>

Additional guidance: <any implementation notes>

PRD/Architecture updates needed: [Yes/No - specify if yes]
```

**Priorities:**
1. **Speed to v0 E2E slice** (working donation flow in docker-compose)
2. **BMAD compliance** (follow PRD/Architecture docs)
3. **No breaking changes** to existing Trail Mixx
4. **Production-ready code** (not prototypes)

---

## COMMUNICATION PROTOCOL

Builder will report:
- **After each block:** Progress update + any blockers
- **After each wave:** WAVE_REPORT JSON + artifacts
- **When stuck:** Question in format above
- **On completion:** Final handoff with deployment guide

---

## REFERENCE DOCUMENTS

**BMAD PRD:** `docs/brownfield-prd.md` (60 pages, 7 epics, 20 stories)
**BMAD Architecture:** `docs/brownfield-architecture.md` (50 pages, complete technical spec)
**ADR-0001:** `app/docs/adr/0001-architecture-foundations.md`
**Run Log:** `app/docs/run_log.md`

**Key Decisions from PRD:**
- Epic 1: Foundation & Architecture Setup (3 stories)
- Epic 2: UI/UX Migration & Rebranding (3 stories)
- Epic 3: Blockchain Integration (3 stories)
- Epic 4: AI Agent Integration (2 stories)
- Epic 5: Strapi CMS Content Management (2 stories)
- Epic 6: Feature Completion - 4 Empty Pages (4 stories)
- Epic 7: Testing & Launch Preparation (3 stories)

**Tech Decisions from Architecture:**
- Express for services (consistency with Trail Mixx)
- Supabase for frontend auth, Strapi for CMS admin
- All new tables prefixed `nwk_` (namespace isolation)
- Next.js API routes as gateway (proxy pattern)
- OpenRouter for multi-provider LLM routing

---

Builder is now resuming Wave 1 work. Expect first question or progress report within next message.
