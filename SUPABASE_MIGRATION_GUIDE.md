# 🗄️ SUPABASE DATABASE SETUP - STEP BY STEP

**Problem:** The migrations reference each other, so they must be run in the correct order.

**Solution:** Follow these exact steps to apply the database schema.

---

## ⚡ QUICK START (3 Minutes)

### **Step 1: Go to Supabase SQL Editor**
```
https://supabase.com/dashboard/project/sbbuxnyvflczfzvsglpe/sql/new
```

### **Step 2: Run First Migration**

Copy and paste the **entire contents** of:
```
supabase/migrations/20250120_initial_schema.sql
```

Click **RUN** (bottom right)

✅ **Expected Result:** "Success. No rows returned"

### **Step 3: Run Second Migration**

Copy and paste the **entire contents** of:
```
supabase/migrations/20250120_impact_tracking.sql
```

Click **RUN** (bottom right)

✅ **Expected Result:** "Success. No rows returned"

### **Step 4: Verify It Worked**

Run this verification query:
```sql
-- Check all tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

✅ **You should see these tables:**
- agents (6 rows)
- agent_logs
- agent_sessions
- ai_conversations
- agentic_waves
- blog_posts (5 rows)
- browser_sessions
- donation_allocations
- donations_feed
- impact_milestones
- impact_projects (5 rows)
- partnerships (5 rows)
- service_health_history
- services (5 rows)
- tutorials (4 rows)
- user_perks
- user_profiles
- variant_results
- voice_sessions

### **Step 5: Verify Agent Data**

Run this query:
```sql
SELECT name, display_name, type, status FROM public.agents;
```

✅ **You should see 6 agents:**
1. sirius - Sirius - The Navigator (orchestrator)
2. andromeda - Andromeda - The Coder (coding)
3. vega - Vega - The Validator (browsing)
4. rigel - Rigel - The Researcher (browsing)
5. cassiopeia - Cassiopeia - The Communicator (voice)
6. betelgeuse - Betelgeuse - The Builder (hybrid)

### **Step 6: Verify Project Data**

Run this query:
```sql
SELECT name, status, current_funding, goal_amount
FROM public.impact_projects
ORDER BY created_at;
```

✅ **You should see 5 projects:**
1. AI-Powered Reading Program (active)
2. Urban Farm Tech Initiative (active)
3. Code.org Partnership (active)
4. AI Ethics Education (completed)
5. Climate Data Platform (active)

---

## 🐛 TROUBLESHOOTING

### Error: "relation public.donations_feed does not exist"

**Cause:** You ran the second migration before the first one.

**Fix:**
1. Delete all tables (or reset database)
2. Run migrations in order: first → second

### Error: "function uuid_generate_v4() does not exist"

**Cause:** UUID extension not installed.

**Fix:** Run this first:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Error: "permission denied for schema public"

**Cause:** User doesn't have permission to create tables.

**Fix:** Make sure you're logged in as the database owner or postgres role.

---

## 🔒 SECURITY CHECK

After running migrations, verify RLS (Row Level Security) is enabled:

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = true;
```

✅ **All tables should show `rowsecurity = true`**

---

## 📊 DATABASE OVERVIEW

### **What We Created:**

**1. Core Tables:**
- `agents` - 6 Stellar AI agents
- `agent_sessions` - Tracks agent invocations
- `agent_logs` - Observability logs
- `services` - Microservices registry

**2. AI & Voice:**
- `ai_conversations` - Chat history
- `voice_sessions` - Voice recordings

**3. Donations & Impact:**
- `donations_feed` - Blockchain donations
- `impact_projects` - Real projects
- `donation_allocations` - Where money goes
- `impact_milestones` - Trackable outcomes

**4. Content:**
- `blog_posts` - Seattle AI/nonprofit news
- `partnerships` - Partner organizations
- `tutorials` - How-to guides

**5. Automation:**
- `browser_sessions` - Browser automation tracking
- `agentic_waves` - Infinite agentic loop

---

## 🎯 WHAT'S NEXT?

After migrations are complete:

1. ✅ Database is ready
2. ⏳ Add SKIP_ENV_VALIDATION to Vercel
3. ⏳ Add AI API keys
4. ⏳ Deploy services

**Total Time:** ~3 minutes

---

## 📝 NOTES

**Why Two Migrations?**
- First: Core schema (agents, donations, auth)
- Second: Impact tracking (projects, blog, partnerships)

**Can I Reset?**
If something goes wrong, you can reset:
```sql
-- ⚠️ WARNING: This deletes everything!
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

Then re-run both migrations from Step 2.

---

## ✅ SUCCESS CHECKLIST

- [ ] Initial schema migration runs without errors
- [ ] Impact tracking migration runs without errors
- [ ] 6 agents exist in `agents` table
- [ ] 5 projects exist in `impact_projects` table
- [ ] 5 partnerships exist in `partnerships` table
- [ ] Views created successfully (`impact_overview`, `project_funding_status`)
- [ ] RLS enabled on all tables

**Once all checked, your database is ready! 🎉**

---

**Questions?** Check the error logs in Supabase Dashboard → Database → Logs
