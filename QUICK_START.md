# ⚡ Quick Start - Stellar Agentic Cockpit

Get the Cockpit running in 5 minutes.

---

## 🚨 Prerequisites

Before you begin:
- [ ] Node.js 22.x installed
- [ ] Yarn 1.22.x installed
- [ ] OpenAI API key
- [ ] Anthropic API key
- [ ] Google AI API key

---

## 🎯 Step 1: Apply Database Migration

**CRITICAL - Do this FIRST!**

1. Go to Supabase SQL Editor:
   https://supabase.com/dashboard/project/sbbuxnyvflczfzvsglpe/sql/new

2. Copy file: `supabase/migrations/20250120_initial_schema.sql`

3. Paste entire contents and click **RUN**

4. Verify: Run `SELECT * FROM agents;`
   - You should see 6 agents (sirius, andromeda, vega, rigel, cassiopeia, betelgeuse)

✅ Database ready!

---

## 🎯 Step 2: Install Dependencies

```bash
# Root dependencies
yarn install

# Stellar Agents
cd services/stellar-agents
yarn install

# Web App
cd ../../apps/web
yarn install
```

---

## 🎯 Step 3: Configure Environment

**Create `.env` in `services/stellar-agents/`:**

```env
PORT=3004
SUPABASE_URL=https://sbbuxnyvflczfzvsglpe.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<paste_from_env.production>
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AIza...
```

**Create `.env.local` in `apps/web/`:**

```env
NEXT_PUBLIC_SUPABASE_URL=https://sbbuxnyvflczfzvsglpe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<paste_from_env.production>
STELLAR_AGENTS_URL=http://localhost:3004
```

> **Where to find keys:**
> - Supabase keys: Already in `.env.production`
> - OpenAI: https://platform.openai.com/api-keys
> - Anthropic: https://console.anthropic.com/settings/keys
> - Google AI: https://aistudio.google.com/app/apikey

---

## 🎯 Step 4: Start Services

Open 2 terminals:

**Terminal 1: Stellar Agents**
```bash
cd services/stellar-agents
yarn dev
```

Wait for: `✨ Stellar Agents Service running on port 3004`

**Terminal 2: Web App**
```bash
cd apps/web
yarn dev
```

Wait for: `Ready on http://localhost:3000`

---

## 🎯 Step 5: Test It!

### Via Browser

Open: **http://localhost:3000/cockpit**

You should see:
- ✅ 6 agent cards with cosmic design
- ✅ Live logs viewer at the bottom
- ✅ Floating voice button (bottom-right)

Click any agent card to see details.

### Via API

```bash
# Test Andromeda (code generation)
curl -X POST http://localhost:3004/agents/andromeda/execute \
  -H "Content-Type: application/json" \
  -d '{
    "type": "generate_code",
    "description": "Create a TypeScript function that sorts an array",
    "parameters": {"language": "typescript"}
  }'
```

---

## ✅ Success Checklist

- [ ] Database has 6 agents
- [ ] Stellar Agents service running (port 3004)
- [ ] Web app running (port 3000)
- [ ] Dashboard shows agent cards
- [ ] API call returns code
- [ ] No console errors

---

## 🐛 Troubleshooting

### "Missing Supabase environment variables"
→ Check `.env` files have correct keys from `.env.production`

### "Agent not found in database"
→ Re-run the Supabase migration SQL

### "TypeScript errors"
→ Run `yarn install` again in both `services/stellar-agents` and `apps/web`

### "Cannot connect to Stellar Agents"
→ Make sure port 3004 is not in use: `lsof -ti:3004 | xargs kill -9`

### "Font not loading"
→ Clear browser cache, fonts are fetched from Google Fonts

---

## 🎉 You're Ready!

The Cockpit is now running. Try:

1. **View Agents:** Visit `/cockpit`
2. **See Logs:** Visit `/cockpit/observability`
3. **Agent Details:** Click any agent card
4. **Voice Button:** Click the floating mic icon

---

## 📚 Next Steps

1. Read `STELLAR_COCKPIT_README.md` for full documentation
2. Explore agent capabilities in `/cockpit/agents/[name]`
3. Copy `CODEX_PHASE2_PROMPT.md` for advanced features
4. Check `constitution.md` for development rules

---

**Need help?** Check the full README or review the specification files.

**Total Setup Time:** ~5-10 minutes ⚡

