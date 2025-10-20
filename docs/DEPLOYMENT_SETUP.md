# New World Kids - Deployment Setup Guide

This guide covers the complete setup for deploying New World Kids platform to production using Vercel (frontend) + Supabase (database/auth/realtime).

## Table of Contents
1. [Supabase Setup](#supabase-setup)
2. [Vercel Deployment](#vercel-deployment)
3. [Environment Variables](#environment-variables)
4. [Database Schema](#database-schema)
5. [Testing the Setup](#testing-the-setup)

---

## Supabase Setup

### Project Information
- **Project ID**: `sbbuxnyvflczfzvsglpe`
- **Project URL**: `https://sbbuxnyvflczfzvsglpe.supabase.co`
- **Pricing**: FREE tier (0-500MB database, 50K MAU) → $25/mo Pro (8GB database, 100K MAU)

### Features Used
1. **PostgreSQL Database** - Stores AI conversations, donation feed, user perks
2. **Authentication** - Email/password + OAuth providers
3. **Realtime** - Live donation feed for dashboard
4. **Row Level Security (RLS)** - Secure data access

### Step 1: Configure Database Schema

Go to Supabase SQL Editor and run this schema:

```sql
-- AI Conversations Table
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  agent_type TEXT NOT NULL CHECK (agent_type IN ('nova-sign', 'echo-agent', 'flow-agent', 'pulse-agent')),
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Donations Feed Table (Real-time)
CREATE TABLE donations_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  amount NUMERIC(18, 8) NOT NULL,
  currency TEXT NOT NULL CHECK (currency IN ('SOL', 'USDC')),
  usd_value NUMERIC(18, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Perks Table
CREATE TABLE user_perks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  perk_type TEXT NOT NULL,
  perk_data JSONB,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX idx_ai_conversations_created_at ON ai_conversations(created_at DESC);
CREATE INDEX idx_donations_feed_created_at ON donations_feed(created_at DESC);
CREATE INDEX idx_user_perks_user_id ON user_perks(user_id);
```

### Step 2: Enable Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_perks ENABLE ROW LEVEL SECURITY;

-- AI Conversations: Users can only see their own conversations
CREATE POLICY "Users can view their own conversations"
  ON ai_conversations FOR SELECT
  USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can create their own conversations"
  ON ai_conversations FOR INSERT
  WITH CHECK (auth.uid()::TEXT = user_id);

-- Donations Feed: Public read-only (for live feed)
CREATE POLICY "Donations feed is publicly readable"
  ON donations_feed FOR SELECT
  USING (true);

CREATE POLICY "Only service can insert donations"
  ON donations_feed FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- User Perks: Users can view their own perks
CREATE POLICY "Users can view their own perks"
  ON user_perks FOR SELECT
  USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Only service can manage perks"
  ON user_perks FOR INSERT
  WITH CHECK (auth.role() = 'service_role');
```

### Step 3: Enable Realtime for Donations Feed

1. Go to **Database** → **Replication**
2. Find `donations_feed` table
3. Toggle **Enable Realtime** to ON
4. Save changes

### Step 4: Get API Keys

1. Go to **Project Settings** → **API**
2. Copy the following:
   - **Project URL**: `https://sbbuxnyvflczfzvsglpe.supabase.co`
   - **anon/public key**: For client-side (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - **service_role key**: For server-side (SUPABASE_SERVICE_ROLE_KEY)

⚠️ **NEVER** expose the `service_role` key in client-side code!

---

## Vercel Deployment

### Project Information
- **Project ID**: `prj_uyBo0MfsraJRp7k7ptUTt9A3vc0t`
- **Token**: `WQj9DdjV7ZP93J1rN0BcY16F` (stored in `.env.local` - DO NOT COMMIT)

### Step 1: Install Vercel CLI

```bash
npm i -g vercel
```

### Step 2: Link Project

```bash
cd strapi-template-new-world-kids
vercel link --project=prj_uyBo0MfsraJRp7k7ptUTt9A3vc0t --token=WQj9DdjV7ZP93J1rN0BcY16F
```

### Step 3: Configure Build Settings

In Vercel Dashboard → Project Settings → Build & Development Settings:

```
Framework Preset: Next.js
Build Command: cd apps/web && yarn build
Output Directory: apps/web/.next
Install Command: yarn install
Root Directory: ./
```

### Step 4: Set Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables, add:

**Production + Preview + Development:**

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://sbbuxnyvflczfzvsglpe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_anon_key_from_supabase>
SUPABASE_URL=https://sbbuxnyvflczfzvsglpe.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your_service_role_key_from_supabase>

# Strapi CMS
NEXT_PUBLIC_STRAPI_URL=<your_strapi_production_url>
STRAPI_REST_READONLY_API_KEY=<your_strapi_readonly_key>

# Blockchain
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
BLOCKCHAIN_SERVICE_URL=<your_blockchain_service_url>

# Feature Flags
NEXT_PUBLIC_FEATURE_FLAGS=ENABLE_NEW_BRANDING,ENABLE_NFT_RECEIPTS
```

### Step 5: Deploy

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

---

## Environment Variables

### Local Development (.env.local)

Copy from `.env.example`:

```env
# Vercel
VERCEL_PROJECT_ID=prj_uyBo0MfsraJRp7k7ptUTt9A3vc0t
VERCEL_TOKEN=WQj9DdjV7ZP93J1rN0BcY16F

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://sbbuxnyvflczfzvsglpe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from_supabase_dashboard>
SUPABASE_URL=https://sbbuxnyvflczfzvsglpe.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<from_supabase_dashboard>

# Database (PostgreSQL - local dev)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/newworldkids

# Blockchain Service
PORT=3002
SOLANA_NETWORK=devnet
HELIUS_RPC_URL=https://devnet.helius-rpc.com/?api-key=YOUR_KEY
NFT_MINT_WALLET_PRIVATE_KEY=<your_dev_wallet>

# AI Agents Service
AI_AGENTS_PORT=3003
OPENROUTER_API_KEY=sk-or-v1-xxx
```

### Security Notes

1. **NEVER commit `.env.local`** - Already in `.gitignore`
2. **Service Role Key** = admin access - only use server-side
3. **Anon Key** = limited RLS access - safe for client-side
4. **Wallet Private Keys** - Use separate wallets for dev/prod

---

## Database Schema

### Architecture Overview

```
┌─────────────────────────────────────────────────┐
│              Supabase PostgreSQL                │
│                                                 │
│  ┌─────────────────┐  ┌──────────────────┐    │
│  │ ai_conversations│  │  donations_feed  │    │
│  │  (RLS: private) │  │  (RLS: public)   │    │
│  │                 │  │  [REALTIME ON]   │    │
│  └─────────────────┘  └──────────────────┘    │
│                                                 │
│  ┌─────────────────┐                           │
│  │   user_perks    │                           │
│  │  (RLS: private) │                           │
│  └─────────────────┘                           │
└─────────────────────────────────────────────────┘
```

### Table Relationships

```mermaid
erDiagram
    ai_conversations {
        uuid id PK
        text user_id
        text agent_type
        text message
        text response
        int tokens_used
        timestamptz created_at
    }

    donations_feed {
        uuid id PK
        text donation_id
        text wallet_address
        numeric amount
        text currency
        numeric usd_value
        timestamptz created_at
    }

    user_perks {
        uuid id PK
        text user_id
        text perk_type
        jsonb perk_data
        timestamptz unlocked_at
        timestamptz created_at
    }
```

---

## Testing the Setup

### 1. Test Supabase Connection (Local)

```bash
# From project root
cd services/ai-agents
yarn dev
```

Check logs for: `Supabase credentials not set` (expected if env vars missing)

### 2. Test Realtime Donations Feed

```typescript
// In browser console on deployed site
import { supabase } from '@/lib/supabase/client';

const channel = supabase
  .channel('donations_feed')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'donations_feed'
  }, (payload) => {
    console.log('New donation!', payload.new);
  })
  .subscribe();
```

### 3. Test Vercel Deployment

```bash
# Deploy to preview URL
vercel

# Visit the preview URL and check:
# - Next.js app loads
# - Supabase client initialized (check browser console)
# - No environment variable errors
```

### 4. Test AI Conversation Save

```bash
curl -X POST https://your-preview-url.vercel.app/api/ai/nova-sign/chat \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "message": "Hello NovaSign!"
  }'
```

Check Supabase dashboard → Table Editor → `ai_conversations` for new row.

---

## Troubleshooting

### "Missing Supabase environment variables"

✅ Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set in:
- Local: `.env.local`
- Vercel: Project Settings → Environment Variables

### "Row Level Security policy violation"

✅ Check that RLS policies are created correctly
✅ Ensure client is authenticated before accessing private tables
✅ Use `service_role` key (server-side only) to bypass RLS

### "Realtime not working"

✅ Enable Realtime for `donations_feed` table in Supabase Dashboard
✅ Check browser console for websocket connection errors
✅ Verify RLS policy allows public SELECT on `donations_feed`

### "Vercel build fails"

✅ Check that `apps/web` has all required dependencies
✅ Ensure `@supabase/supabase-js` is in `apps/web/package.json`
✅ Verify build command points to correct directory

---

## MCP Integration

You've provided the Supabase MCP connection:

```
https://mcp.supabase.com/mcpsbp_4a59dc81197128115021f1a3b33a69d3d91aa40e
```

This allows Claude Code to directly interact with your Supabase database via the Model Context Protocol.

### Available MCP Servers

1. **Supabase MCP**: `https://mcp.supabase.com/mcpsbp_...`
   - Direct database queries
   - Schema management
   - Real-time monitoring

2. **ByteRover MCP**: `https://mcp.byterover.dev/v2/mcp`
   - File system access
   - Code analysis

---

## Cost Breakdown

### Supabase (Production)

- **FREE Tier**: $0/mo
  - 500MB database
  - 2GB file storage
  - 50K monthly active users
  - 2GB bandwidth

- **Pro Tier**: $25/mo (recommended for production)
  - 8GB database
  - 100GB file storage
  - 100K monthly active users
  - 50GB bandwidth
  - Daily backups
  - Priority support

### Vercel

- **Hobby**: $0/mo
  - Unlimited deployments
  - 100GB bandwidth
  - Automatic HTTPS
  - Good for MVP/testing

- **Pro**: $20/mo per member
  - Team collaboration
  - Advanced analytics
  - Priority support
  - More build minutes

### Total Estimated Monthly Cost

**MVP/Testing**: $0 (Supabase FREE + Vercel Hobby)
**Production**: $25-45 (Supabase Pro + Vercel Hobby/Pro)

---

## Next Steps

1. ✅ Configure Supabase database schema
2. ✅ Enable Row Level Security policies
3. ✅ Enable Realtime for donations_feed
4. ⏳ Get Supabase API keys and add to Vercel
5. ⏳ Deploy to Vercel preview
6. ⏳ Test all features end-to-end
7. ⏳ Deploy to production when ready

---

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Next.js Deployment](https://vercel.com/docs/frameworks/nextjs)
- [Supabase + Next.js Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
