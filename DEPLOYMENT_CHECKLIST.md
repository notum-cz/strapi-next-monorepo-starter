# ✅ Deployment Checklist - Stellar Agentic Cockpit

Follow this checklist to get your Cockpit running.

---

## Phase 1: Database Setup

- [ ] **Open Supabase SQL Editor**
  - Go to: https://supabase.com/dashboard/project/sbbuxnyvflczfzvsglpe/sql/new

- [ ] **Copy Migration File**
  - Open: `supabase/migrations/20250120_initial_schema.sql`
  - Copy entire contents (Ctrl+A, Ctrl+C)

- [ ] **Run Migration**
  - Paste into SQL Editor
  - Click "Run" button
  - Wait for success message

- [ ] **Verify Migration**
  - Run: `SELECT * FROM agents;`
  - Should return 6 rows (sirius, andromeda, vega, rigel, cassiopeia, betelgeuse)
  - Run: `SELECT COUNT(*) FROM services;`
  - Should return 5

✅ **Database is ready!**

---

## Phase 2: Get API Keys

- [ ] **OpenAI API Key**
  - Visit: https://platform.openai.com/api-keys
  - Click "Create new secret key"
  - Copy key (starts with `sk-`)
  - Save somewhere safe

- [ ] **Anthropic API Key**
  - Visit: https://console.anthropic.com/settings/keys
  - Click "Create Key"
  - Copy key (starts with `sk-ant-`)
  - Save somewhere safe

- [ ] **Google AI API Key**
  - Visit: https://aistudio.google.com/app/apikey
  - Click "Create API Key"
  - Copy key (starts with `AIza`)
  - Save somewhere safe

✅ **All API keys obtained!**

---

## Phase 3: Environment Setup

- [ ] **Create `services/stellar-agents/.env`**
  ```env
  PORT=3004
  SUPABASE_URL=https://sbbuxnyvflczfzvsglpe.supabase.co
  SUPABASE_SERVICE_ROLE_KEY=<PASTE FROM .env.production>
  OPENAI_API_KEY=sk-<YOUR KEY>
  ANTHROPIC_API_KEY=sk-ant-<YOUR KEY>
  GOOGLE_API_KEY=AIza<YOUR KEY>
  ```

- [ ] **Create `apps/web/.env.local`**
  ```env
  NEXT_PUBLIC_SUPABASE_URL=https://sbbuxnyvflczfzvsglpe.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=<PASTE FROM .env.production>
  STELLAR_AGENTS_URL=http://localhost:3004
  ```

- [ ] **Get Supabase Keys from `.env.production`**
  - Open `.env.production` in root directory
  - Copy `SUPABASE_SERVICE_ROLE_KEY`
  - Copy `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Paste into .env files above

✅ **Environment configured!**

---

## Phase 4: Install Dependencies

Open terminal in project root:

- [ ] **Install Root Dependencies**
  ```bash
  yarn install
  ```

- [ ] **Install Stellar Agents Dependencies**
  ```bash
  cd services/stellar-agents
  yarn install
  cd ../..
  ```

- [ ] **Install Web App Dependencies**
  ```bash
  cd apps/web
  yarn install
  cd ../..
  ```

✅ **All dependencies installed!**

---

## Phase 5: Start Services

- [ ] **Open 2 Terminals**

- [ ] **Terminal 1: Start Stellar Agents**
  ```bash
  cd services/stellar-agents
  yarn dev
  ```
  Wait for: `✨ Stellar Agents Service running on port 3004`

- [ ] **Terminal 2: Start Web App**
  ```bash
  cd apps/web
  yarn dev
  ```
  Wait for: `Ready on http://localhost:3000`

✅ **All services running!**

---

## Phase 6: Verify Installation

- [ ] **Test Health Checks**
  ```bash
  # In new terminal
  curl http://localhost:3004/health
  # Should return: {"status":"healthy","service":"stellar-agents",...}
  ```

- [ ] **Test Agent Execution**
  ```bash
  curl -X POST http://localhost:3004/agents/cassiopeia/execute \
    -H "Content-Type: application/json" \
    -d '{"type":"transcribe","parameters":{"mockTranscript":"Hello world"}}'
  # Should return success with transcript
  ```

- [ ] **Test Web UI**
  - Open browser: http://localhost:3000/cockpit
  - Should see 6 agent cards
  - Should see live logs viewer
  - Should see floating voice button (bottom-right)

- [ ] **Click Agent Card**
  - Click any agent card
  - Should navigate to detail page
  - Should show capabilities and model config

- [ ] **Check Observability**
  - Navigate to: http://localhost:3000/cockpit/observability
  - Should see log level filters
  - Should see "Live Streaming" indicator

✅ **Everything is working!**

---

## Phase 7: Optional - Start Additional Services

If you want to test the full stack:

- [ ] **Terminal 3: Big-3 Orchestrator**
  ```bash
  cd services/big-3-orchestrator
  yarn install
  yarn dev
  ```
  Wait for: `✨ Big-3 Orchestrator running on port 3010`

- [ ] **Terminal 4: Browser Service**
  ```bash
  cd services/browser-service
  yarn install
  npx playwright install chromium
  yarn dev
  ```
  Wait for: `✨ Browser Service running on port 3013`

- [ ] **Terminal 5: Chrome DevTools MCP**
  ```bash
  cd services/chrome-devtools-mcp
  yarn install
  yarn dev
  ```
  Wait for: `✨ Chrome DevTools MCP running on port 3014`

✅ **Full stack running!**

---

## 🎉 Success! You're Done!

If all checkboxes above are marked, you have:
- ✅ Database with all tables and seed data
- ✅ 6 stellar agents running
- ✅ Beautiful cockpit UI accessible
- ✅ Real-time logs streaming
- ✅ Voice command button working
- ✅ All API endpoints responding

---

## 🚀 What's Next?

### Option 1: Explore the Cockpit
- Try different agents via API
- Watch logs in real-time
- Click through agent details
- Test voice button

### Option 2: Build Features
- Add your own agents
- Create custom UI components
- Extend existing agents

### Option 3: Deploy to Production
- Use `CODEX_PHASE2_PROMPT.md` to add DevOps
- Set up Docker containers
- Configure CI/CD pipeline

---

## 🐛 Troubleshooting

### Issue: "Missing Supabase environment variables"
✅ **Fix:** Check `.env` files have correct keys from `.env.production`

### Issue: "Cannot connect to database"
✅ **Fix:** Verify Supabase migration was applied (run SELECT queries)

### Issue: "Port already in use"
✅ **Fix:** Kill existing processes:
```bash
# Kill port 3004
lsof -ti:3004 | xargs kill -9

# Kill port 3000
lsof -ti:3000 | xargs kill -9
```

### Issue: "TypeScript errors"
✅ **Fix:** Delete node_modules and reinstall:
```bash
rm -rf node_modules
yarn install
```

### Issue: "Agent not found in database"
✅ **Fix:** Re-run Supabase migration SQL

### Issue: "Font not loading"
✅ **Fix:** Clear browser cache (Ctrl+Shift+Del)

---

## 📚 Documentation

**After completing this checklist, read:**

1. `QUICK_START.md` - Condensed setup guide
2. `STELLAR_COCKPIT_README.md` - Complete documentation
3. `BUILD_COMPLETE.md` - What was built
4. `CODEX_PHASE2_PROMPT.md` - For adding advanced features

---

## ⏱️ Estimated Time

- Phase 1 (Database): 2 minutes
- Phase 2 (API Keys): 5 minutes
- Phase 3 (Environment): 3 minutes
- Phase 4 (Dependencies): 5 minutes
- Phase 5 (Start Services): 2 minutes
- Phase 6 (Verification): 3 minutes

**Total: ~20 minutes**

---

## 🎊 Congratulations!

You now have a fully functional Stellar Agentic Cockpit with:
- 6 AI agents
- Real-time monitoring
- Beautiful UI
- Voice interface
- Production-ready architecture

**Enjoy! 🌟**

