# ADR-0001: Architecture Foundations

**Status:** Accepted
**Date:** 2025-10-20
**Deciders:** Architect (GPT-5 Thinking), Builder (Claude Code)

---

## Context

Transforming Trail Mixx (radio platform) into New World Kids (nonprofit education + wildlife conservation platform) requires architectural decisions on:
1. Backend framework selection
2. Authentication strategy
3. Database schema namespacing
4. Service communication patterns
5. AI provider routing

---

## Decision

### 1. Backend Framework: Express (Node.js)

**Chosen:** Express over FastAPI

**Rationale:**
- Consistency with existing Trail Mixx services (Strapi + stream service both Node)
- Easier monorepo integration (single runtime)
- Better TypeScript ecosystem for blockchain/AI SDKs
- Team familiarity and existing patterns

**Alternatives Considered:**
- FastAPI (Python): Better for ML pipelines, but adds runtime complexity
- NestJS: Over-engineered for our service scope

### 2. Authentication Strategy: Dual System

**Chosen:** Supabase (frontend users) + Strapi (CMS admins)

**Rationale:**
- Supabase provides real-time features needed for donation feed
- Strapi's built-in auth perfect for CMS admin panel
- Clear separation of concerns: public users vs content managers
- Both use JWT for stateless auth

**Integration:**
- Next.js middleware checks Supabase JWT for protected routes
- Strapi API routes check Strapi JWT
- No cross-auth dependencies

### 3. Database Namespace: Prefix Strategy

**Chosen:** All new tables prefixed with `nwk_`

**Rationale:**
- Zero collision risk with Trail Mixx tables
- Clear visual separation in schema
- Easy rollback (drop tables matching `nwk_%`)
- Supports gradual migration

**Examples:**
- `nwk_donations`
- `nwk_nft_receipts`
- `nwk_user_perks`
- `nwk_blockchain_txns`

### 4. Service Communication: API Gateway Pattern

**Chosen:** Next.js API routes as gateway to backend services

**Rationale:**
- Single entry point for frontend
- Simplified CORS configuration
- Request/response transformation layer
- Auth token injection
- Rate limiting at gateway

**Pattern:**
```typescript
// apps/web/src/app/api/blockchain/donate/route.ts
export async function POST(req: Request) {
  const token = await getSupabaseToken();
  const response = await fetch('http://blockchain:3002/donate', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(await req.json())
  });
  return Response.json(await response.json());
}
```

### 5. AI Provider: OpenRouter with Per-Agent Models

**Chosen:** OpenRouter as universal LLM router

**Rationale:**
- Single API key for all providers (OpenAI, Anthropic, Meta, etc.)
- Cost optimization (free/cheap models available)
- Provider failover built-in
- Easy model switching via ENV vars
- Unified billing

**Model Map:**
- Default: `meta-llama/llama-3.1-8b-instruct:free` (fallback)
- NovaSign (Web3 educator): `openai/gpt-4-turbo`
- EchoAgent (Conservation): `anthropic/claude-3-5-sonnet`
- FlowAgent (Donations): `openai/gpt-4-turbo`
- PulseAgent (Impact): `anthropic/claude-3-5-sonnet`

---

## Consequences

**Positive:**
- Consistent tech stack (Node/TypeScript)
- Clear service boundaries
- Flexible auth strategy
- Safe database migrations
- Cost-optimized AI

**Negative:**
- Dual auth adds complexity
- API gateway adds latency (~10-20ms)
- OpenRouter vendor lock-in (mitigated by standard OpenAI-compatible API)

**Risks:**
- OpenRouter API limits (mitigate: caching, rate limits)
- Supabase costs with scale (mitigate: monitor usage, set caps)

---

## Compliance

- WCAG 2.1 AA: Next.js supports SSR for screen readers
- GDPR: Supabase supports data export/deletion
- PCI: N/A (crypto donations only)
