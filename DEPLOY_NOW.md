# ⚡ DEPLOY NOW - Quick Production Deployment

**Current Status:** Vercel deployments are failing. Let's fix them and get everything live.

---

## 🚨 Immediate Actions

### 1. Fix Vercel Frontend (5 minutes)

**Go to Vercel Dashboard:**
https://vercel.com/jeremy-bowers-s-projects/strapi-template-new-world-kids/settings/environment-variables

**Add These Environment Variables:**

| Key | Value | Where to Find It |
|-----|-------|------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://sbbuxnyvflczfzvsglpe.supabase.co` | Already correct |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (your anon key) | Copy from `.env.production` file |
| `SKIP_ENV_VALIDATION` | `1` | Type this exactly |

**How to get NEXT_PUBLIC_SUPABASE_ANON_KEY:**
1. Open file: `.env.production` in your project root
2. Find line starting with `NEXT_PUBLIC_SUPABASE_ANON_KEY=`
3. Copy everything after the `=`
4. Paste into Vercel

**Then Redeploy:**
```bash
# Option A: Via Git
git add .
git commit -m "Fix Vercel deployment configuration"
git push origin main

# Option B: Via Vercel CLI
vercel --prod
```

### 2. Apply Database Migrations (CRITICAL - 2 minutes)

**Go to Supabase SQL Editor:**
https://supabase.com/dashboard/project/sbbuxnyvflczfzvsglpe/sql/new

**Run Migration 1:**
1. Open file: `supabase/migrations/20250120_initial_schema.sql`
2. Copy ALL contents (Ctrl+A, Ctrl+C)
3. Paste into Supabase SQL Editor
4. Click "RUN"
5. Wait for success message

**Run Migration 2:**
1. Open file: `supabase/migrations/20250120_impact_tracking.sql`
2. Copy ALL contents
3. Paste into Supabase SQL Editor
4. Click "RUN"
5. Wait for success message

**Verify:**
```sql
SELECT * FROM agents;  -- Should return 6 rows
SELECT * FROM impact_projects;  -- Should return 5 rows
```

---

## 🎯 What You'll Have After Step 1 & 2

✅ **Frontend Live:** https://strapi-template-new-world-kids.vercel.app
- `/impact` - Public dashboard with projects, partnerships, blog
- `/cockpit` - Admin dashboard (but agents won't work yet - no backend)

⚠️ **Backend:** Not deployed yet (agents won't execute)

---

## 🚀 Optional: Deploy Backend Services

**NEW: One-Command Deployment** 🎉

We've created automated deployment scripts! Choose ONE option:

### Option A: Docker Compose - Local Testing (Easiest)

```bash
# One command to start all 4 backend services
./deploy.sh local

# Or on Windows:
docker-compose up -d

# Verify deployment
node verify-deployment.js local
```

This starts all services at once:
- Stellar Agents: http://localhost:3004
- Big-3 Orchestrator: http://localhost:3010
- Browser Service: http://localhost:3013
- Chrome DevTools MCP: http://localhost:3014

**Prerequisites:**
- Docker Desktop installed
- Create `.env.local` file (see `ENV_SETUP.md`)

**Stop services:**
```bash
docker-compose down
```

### Option B: Deploy to Railway (Recommended for Production)

**NEW: Automated Railway Deployment!**

```bash
# One command to deploy all services to Railway
./deploy.sh railway

# Then verify
node verify-deployment.js production
```

**Manual Steps (if automation fails):**

**1. Sign up for Railway:**
- Go to: https://railway.app
- Click "Login with GitHub"
- Authorize Railway

**2. Install Railway CLI:**
```bash
npm install -g @railway/cli
railway login
```

**3. Deploy Services:**
```bash
# Deploy each service
cd services/stellar-agents && railway up && cd ../..
cd services/big-3-orchestrator && railway up && cd ../..
cd services/browser-service && railway up && cd ../..
cd services/chrome-devtools-mcp && railway up && cd ../..
```

**4. Set Environment Variables:**
See `ENV_SETUP.md` for complete guide, or use:
```bash
railway variables set PORT=3004
railway variables set SUPABASE_URL=https://sbbuxnyvflczfzvsglpe.supabase.co
railway variables set SUPABASE_SERVICE_ROLE_KEY=<your_key>
railway variables set OPENAI_API_KEY=<your_key>
railway variables set ANTHROPIC_API_KEY=<your_key>
railway variables set GOOGLE_API_KEY=<your_key>
```

**5. Get Service URLs:**
```bash
railway status
```

**6. Update Vercel:**
- Add `STELLAR_AGENTS_URL` = `<your railway URL>`
- Redeploy

**Cost:** Free tier gives $5/month credit

### Option C: Deploy to Render (Free Tier Available)

**1. Sign up:**
- Go to: https://render.com
- Sign up with GitHub

**2. New Web Service:**
- Click "New +" → "Web Service"
- Connect GitHub repo: `strapi-template-new-world-kids`
- Root Directory: `services/stellar-agents`
- Build Command: `yarn install && yarn build`
- Start Command: `node dist/server.js`

**3. Environment Variables:**
Add the same as Railway (above)

**4. Deploy:**
- Render will build and deploy
- Copy the URL

**Cost:** Free tier available (with limitations)

---

## ✅ Verification Steps

### After Deploying Frontend

**1. Visit Public Dashboard:**
```
https://strapi-template-new-world-kids.vercel.app/impact
```

**Should see:**
- ✅ Impact stats (4 metric cards)
- ✅ 5 Seattle projects with funding bars
- ✅ 5 Seattle partnerships
- ✅ 5 blog posts

**If you see errors:**
- Check browser console (F12)
- Verify Supabase migrations were applied
- Check Vercel environment variables

**2. Visit Admin Cockpit:**
```
https://strapi-template-new-world-kids.vercel.app/cockpit
```

**Should see:**
- ✅ 6 agent cards (Sirius, Andromeda, Vega, etc.)
- ✅ Live logs viewer at bottom
- ✅ Floating voice button (bottom-right)

**If agents don't load:**
- Migrations not applied
- Supabase environment variables incorrect

**3. Click a Blog Post:**
```
https://strapi-template-new-world-kids.vercel.app/blog/ai2-open-source-education-model
```

**Should see:**
- ✅ Full article with markdown rendering
- ✅ Category badge
- ✅ Author info
- ✅ Tags

### After Deploying Backend

**1. Health Check:**
```bash
curl https://stellar-agents-production.up.railway.app/health
```

**Should return:**
```json
{
  "status": "healthy",
  "service": "stellar-agents",
  "agents": ["sirius", "andromeda", "vega", "rigel", "cassiopeia", "betelgeuse"]
}
```

**2. Execute an Agent:**
```bash
curl -X POST https://stellar-agents-production.up.railway.app/agents/sirius/execute \
  -H "Content-Type: application/json" \
  -d '{
    "type": "plan_feature",
    "description": "Add user authentication"
  }'
```

**Should return:**
```json
{
  "success": true,
  "output": { "goal": "...", "steps": [...] },
  "tokensUsed": 150
}
```

**3. Check Vercel Integration:**
- Visit: https://strapi-template-new-world-kids.vercel.app/cockpit
- Click on "Sirius" agent
- Click "Execute Task" (if button exists)
- Should see agent response

---

## 🎊 Success Criteria

When everything is deployed correctly:

### Frontend (Vercel) ✅
- [ ] Build succeeds (green checkmark in Vercel dashboard)
- [ ] `/impact` loads without errors
- [ ] `/cockpit` loads and shows 6 agents
- [ ] Blog posts are clickable and render
- [ ] No console errors (check F12)
- [ ] Fonts load correctly

### Database (Supabase) ✅
- [ ] 19 tables exist
- [ ] 6 agents seeded
- [ ] 5 projects seeded
- [ ] 5 partnerships seeded
- [ ] 5 blog posts seeded

### Backend (Railway/Render) - Optional
- [ ] Service is running
- [ ] Health check returns 200
- [ ] Agent execution works via API
- [ ] Logs appear in dashboard

---

## 🔥 Common Issues & Fixes

### Issue: Vercel Build Fails

**Error:** "Module not found: Can't resolve '@/lib/utils'"

**Fix:**
1. Check that `apps/web/src/lib/utils.ts` exists
2. If missing, create it with:
```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### Issue: Database Tables Don't Exist

**Error:** "relation 'agents' does not exist"

**Fix:**
- You didn't apply the migrations
- Go back to "Apply Database Migrations" section
- Run both SQL files

### Issue: Environment Variables Not Working

**Error:** "Missing Supabase environment variables"

**Fix:**
1. Go to Vercel dashboard
2. Settings → Environment Variables
3. Make sure NEXT_PUBLIC_SUPABASE_ANON_KEY is set
4. Redeploy

### Issue: Agents Don't Show

**Error:** Dashboard loads but shows 0 agents

**Fix:**
- Database migrations not applied
- Run: `SELECT * FROM agents;` in Supabase SQL editor
- If empty, run the first migration file

### Issue: Blog Posts Don't Render

**Error:** Blog page is blank

**Fix:**
- Second migration not applied
- Run `20250120_impact_tracking.sql` migration

---

## 🛠️ New Deployment Tools

We've created comprehensive deployment infrastructure:

### Files Created
- **`docker-compose.yml`** - Run all 4 services locally with one command
- **`deploy.sh`** - Automated deployment script (local/railway/render)
- **`verify-deployment.js`** - Test all services and health checks
- **`ENV_SETUP.md`** - Complete environment variables guide
- **`Dockerfile`** (x4) - Production containers for each service
- **`.dockerignore`** - Optimized Docker builds

### Quick Commands

```bash
# Local deployment with Docker
./deploy.sh local
docker-compose up -d

# Railway deployment (automated)
./deploy.sh railway

# Verify any deployment
node verify-deployment.js local       # Test local
node verify-deployment.js production  # Test production

# View logs (Docker)
docker-compose logs -f

# Stop services (Docker)
docker-compose down
```

### Documentation

- **`DEPLOY_NOW.md`** - This file (quick start)
- **`PRODUCTION_DEPLOYMENT.md`** - Comprehensive deployment guide
- **`ENV_SETUP.md`** - Environment variables setup
- **`BUILD_FINAL.md`** - Complete build summary

---

## 📞 Quick Reference

**Vercel Dashboard:**
https://vercel.com/jeremy-bowers-s-projects/strapi-template-new-world-kids

**Supabase Dashboard:**
https://supabase.com/dashboard/project/sbbuxnyvflczfzvsglpe

**Your Site (after deployment):**
https://strapi-template-new-world-kids.vercel.app

**Key Pages:**
- `/impact` - Public transparency dashboard
- `/cockpit` - Admin agent dashboard
- `/cockpit/observability` - Live logs
- `/blog/[slug]` - Blog posts

---

## ⏱️ Deployment Time

- **Fix Vercel + Apply Migrations:** 5 minutes
- **Deploy Backend to Railway:** 15 minutes
- **Testing:** 5 minutes
- **Total:** ~25 minutes

---

## 🎯 Start Here

1. **Fix Vercel environment variables** (see Step 1)
2. **Apply both database migrations** (see Step 2)
3. **Push code and redeploy**
4. **Verify `/impact` works**
5. **Optionally deploy backend**

**Let's go! 🚀**
