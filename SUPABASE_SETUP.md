# Supabase Setup Guide

**Project ID:** `sbbuxnyvflczfzvsglpe`

---

## ✅ You Already Have a Supabase Project!

Since you've created the project, we just need to:
1. Get your API keys
2. Set up database schema
3. Configure environment variables
4. Test the connection

---

## Step 1: Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/sbbuxnyvflczfzvsglpe)
2. Go to **Settings** → **API**
3. Copy these values:

```
Project URL: https://sbbuxnyvflczfzvsglpe.supabase.co
Anon/Public Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Service Role Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (SECRET - server only)
```

---

## Step 2: Configure Environment Variables

### **Frontend (apps/web/.env.local)**

```env
# Supabase (replaces Firebase)
NEXT_PUBLIC_SUPABASE_URL=https://sbbuxnyvflczfzvsglpe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### **Backend (services/ai-agents/.env)**

```env
# Supabase (server-side)
SUPABASE_URL=https://sbbuxnyvflczfzvsglpe.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### **Blockchain Service (services/blockchain/.env)**

```env
# Supabase (for real-time donation feed)
SUPABASE_URL=https://sbbuxnyvflczfzvsglpe.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

---

## Step 3: Database Schema Setup

### **Option A: Using Supabase Dashboard (Recommended)**

1. Go to [Database → SQL Editor](https://supabase.com/dashboard/project/sbbuxnyvflczfzvsglpe/sql/new)
2. Run this SQL:

```sql
-- AI Conversations (for chat history)
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  agent_type TEXT NOT NULL,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Donations Feed (for real-time updates)
CREATE TABLE IF NOT EXISTS donations_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  wallet_address TEXT NOT NULL,
  amount_usd NUMERIC NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Perks (for perk tracking)
CREATE TABLE IF NOT EXISTS user_perks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  perk_type TEXT NOT NULL,
  perk_name TEXT NOT NULL,
  status TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_ai_conversations_user ON ai_conversations(user_id);
CREATE INDEX idx_donations_feed_created ON donations_feed(created_at DESC);
CREATE INDEX idx_user_perks_user ON user_perks(user_id);

-- Enable Row Level Security
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_perks ENABLE ROW LEVEL SECURITY;

-- RLS Policies: AI Conversations (users can read their own)
CREATE POLICY "Users can read own conversations"
  ON ai_conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service can insert conversations"
  ON ai_conversations FOR INSERT
  TO service_role
  WITH CHECK (true);

-- RLS Policies: Donations Feed (public read, service write)
CREATE POLICY "Anyone can read donations feed"
  ON donations_feed FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Service can insert donations"
  ON donations_feed FOR INSERT
  TO service_role
  WITH CHECK (true);

-- RLS Policies: User Perks (users can read their own)
CREATE POLICY "Users can read own perks"
  ON user_perks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service can manage perks"
  ON user_perks FOR ALL
  TO service_role
  USING (true);
```

3. Click **Run** to execute

---

## Step 4: Enable Authentication

1. Go to [Authentication → Providers](https://supabase.com/dashboard/project/sbbuxnyvflczfzvsglpe/auth/providers)
2. Enable **Email** provider
3. Configure settings:
   - ✅ Enable email confirmations (optional for dev)
   - ✅ Enable password recovery
   - Set **Site URL:** `http://localhost:3000` (dev) or your production URL

---

## Step 5: Enable Realtime

1. Go to [Database → Replication](https://supabase.com/dashboard/project/sbbuxnyvflczfzvsglpe/database/replication)
2. Enable replication for these tables:
   - ✅ `donations_feed`
   - ✅ `ai_conversations` (optional)
   - ✅ `user_perks` (optional)

---

## Step 6: Test Connection

### **Test from Next.js App:**

```bash
cd apps/web
yarn dev
# Open http://localhost:3000
# Check browser console for Supabase connection logs
```

### **Test from Backend Services:**

```bash
cd services/ai-agents
yarn dev
# Should see "Supabase connected" in logs
```

---

## Supabase vs Firebase Comparison

**What Changed:**

| Feature | Firebase (old) | Supabase (new) |
|---------|---------------|----------------|
| **Database** | Firestore (NoSQL) | PostgreSQL ✅ |
| **Compatible with Strapi** | ❌ No | ✅ Yes |
| **Real-time** | Firestore listeners | Postgres subscriptions |
| **Auth** | Firebase Auth | Supabase Auth |
| **Cost** | Pay-per-use | $0 (free tier) or $25/mo |
| **Complexity** | 2 databases needed | 1 database (Postgres) |

**Benefits of Supabase:**
- ✅ **Same database as Strapi** (PostgreSQL)
- ✅ **No data sync issues** (single source of truth)
- ✅ **Better for relational data** (donations, NFTs, users)
- ✅ **Predictable pricing** ($0 dev, $25 prod)
- ✅ **Built-in real-time** (no custom websockets)

---

## Architecture with Supabase

```
┌─────────────────────────────────────────────┐
│          Next.js Frontend (Port 3000)        │
│  - Supabase Auth (user login/signup)        │
│  - Supabase Realtime (donation feed)        │
└─────────────────────────────────────────────┘
                    ↓
    ┌───────────────────────────────┐
    │  Supabase PostgreSQL Database  │
    │  - ai_conversations            │
    │  - donations_feed              │
    │  - user_perks                  │
    │  - auth.users (built-in)       │
    └───────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│     Backend Services (Express)              │
│  - Blockchain (Port 3002)                   │
│    → Writes to PostgreSQL (Prisma)          │
│    → Publishes to Supabase (real-time)      │
│  - AI Agents (Port 3003)                    │
│    → Stores chats in Supabase               │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│      Strapi CMS (Port 1337)                 │
│  - Shares PostgreSQL with Supabase          │
│  - Content management (blog, projects)      │
└─────────────────────────────────────────────┘
```

**Key Advantage:** ONE PostgreSQL database for everything!

---

## Supabase MCP Integration (Optional)

Supabase has an **official MCP server** for Claude Desktop!

### **Check if Available:**

```bash
# List available MCP servers
claude mcp list
```

If Supabase MCP exists, you can:
- Query database directly from Claude
- Create tables via natural language
- Monitor real-time data
- Manage auth users

---

## Troubleshooting

**Error: "Invalid API key"**
- Double-check anon key copied correctly
- Ensure no extra spaces in `.env`
- Restart dev server after changing env vars

**Error: "Row level security policy violated"**
- Check RLS policies are created
- Ensure user is authenticated for protected tables
- Use service role key for backend operations

**Error: "Database connection failed"**
- Verify project ID in URL: `sbbuxnyvflczfzvsglpe`
- Check Supabase project is active (not paused)
- Verify PostgreSQL is running

---

## Next Steps

- [ ] Copy API keys from Supabase dashboard
- [ ] Update `.env.local` files
- [ ] Run SQL schema setup
- [ ] Enable authentication
- [ ] Test connection
- [ ] Replace Firebase imports with Supabase

---

**Supabase Dashboard:** https://supabase.com/dashboard/project/sbbuxnyvflczfzvsglpe

**Supabase Docs:** https://supabase.com/docs
