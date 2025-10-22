# 🚀 Production Deployment Guide - Stellar Agentic Cockpit

Complete guide to deploying the full stack to production.

---

## 📋 Deployment Architecture

### Frontend (Vercel)
- **App:** Next.js Web App
- **URL:** https://strapi-template-new-world-kids.vercel.app (auto-assigned)
- **Custom Domain:** (configure later)

### Backend Services (Railway/Render/Fly.io)
We'll deploy 4 backend services:
1. **Stellar Agents** (Port 3004)
2. **Big-3 Orchestrator** (Port 3010)
3. **Browser Service** (Port 3013)
4. **Chrome DevTools MCP** (Port 3014)

### Database (Already Hosted)
- **Supabase:** https://sbbuxnyvflczfzvsglpe.supabase.co ✅

---

## 🎯 Phase 1: Fix Vercel Frontend Deployment

### Step 1: Set Environment Variables on Vercel

Go to: https://vercel.com/jeremy-bowers-s-projects/strapi-template-new-world-kids/settings/environment-variables

**Add these environment variables:**

```bash
# Supabase (Public)
NEXT_PUBLIC_SUPABASE_URL=https://sbbuxnyvflczfzvsglpe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_anon_key_from_.env.production>

# Backend Service URLs (will update after deploying services)
STELLAR_AGENTS_URL=https://stellar-agents.up.railway.app
```

**How to get the values:**
1. Open `.env.production` in your project root
2. Copy `NEXT_PUBLIC_SUPABASE_ANON_KEY` value
3. Paste into Vercel environment variables

### Step 2: Update Vercel Configuration

The `vercel.json` is already configured, but let's ensure it's correct:

```json
{
  "version": 2,
  "name": "new-world-kids",
  "buildCommand": "cd apps/web && yarn build",
  "installCommand": "yarn install",
  "framework": "nextjs",
  "outputDirectory": "apps/web/.next",
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "https://sbbuxnyvflczfzvsglpe.supabase.co"
  }
}
```

### Step 3: Redeploy Frontend

```bash
# From project root
git add .
git commit -m "Add Stellar Cockpit and Impact Dashboard"
git push origin main
```

Vercel will auto-deploy. Check: https://vercel.com/jeremy-bowers-s-projects/strapi-template-new-world-kids

---

## 🎯 Phase 2: Deploy Backend Services to Railway

We'll use **Railway** (free tier: $5/month credit) for backend services.

### Why Railway?
- Easy deployment from GitHub
- Free tier available
- Supports environment variables
- Auto-scaling
- Great for Node.js services

### Setup Railway Account

1. Go to: https://railway.app
2. Sign up with GitHub
3. Connect to your repository

### Deploy Service 1: Stellar Agents

**Option A: Via Railway Dashboard**

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose `strapi-template-new-world-kids`
4. Set Root Directory: `services/stellar-agents`
5. Add Environment Variables:
   ```
   PORT=3004
   SUPABASE_URL=https://sbbuxnyvflczfzvsglpe.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=<from .env.production>
   OPENAI_API_KEY=sk-...
   ANTHROPIC_API_KEY=sk-ant-...
   GOOGLE_API_KEY=AIza...
   ```
6. Deploy

**Option B: Via Railway CLI**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Create project
railway init

# Link to service
cd services/stellar-agents
railway up

# Set environment variables
railway variables set PORT=3004
railway variables set SUPABASE_URL=https://sbbuxnyvflczfzvsglpe.supabase.co
railway variables set SUPABASE_SERVICE_ROLE_KEY=<your_key>
railway variables set OPENAI_API_KEY=<your_key>
railway variables set ANTHROPIC_API_KEY=<your_key>
railway variables set GOOGLE_API_KEY=<your_key>
```

**Get Public URL:**
- Railway will assign: `https://stellar-agents-production.up.railway.app`
- Copy this URL

### Deploy Service 2: Big-3 Orchestrator

Repeat the same process for Big-3:

```bash
cd services/big-3-orchestrator
railway up

# Environment variables:
railway variables set PORT=3010
railway variables set OPENAI_API_KEY=<your_key>
railway variables set ANTHROPIC_API_KEY=<your_key>
railway variables set GOOGLE_API_KEY=<your_key>
```

**Get Public URL:**
- Railway will assign: `https://big-3-orchestrator-production.up.railway.app`

### Deploy Service 3: Browser Service

```bash
cd services/browser-service
railway up

# Environment variables:
railway variables set PORT=3013
```

**Note:** Browser service with Playwright may need upgraded plan due to Chrome dependencies.

### Deploy Service 4: Chrome DevTools MCP

```bash
cd services/chrome-devtools-mcp
railway up

# Environment variables:
railway variables set PORT=3014
```

---

## 🎯 Phase 3: Connect Frontend to Backend

### Update Vercel Environment Variables

Once you have Railway URLs, update Vercel:

1. Go to: https://vercel.com/jeremy-bowers-s-projects/strapi-template-new-world-kids/settings/environment-variables

2. Update `STELLAR_AGENTS_URL`:
   ```
   STELLAR_AGENTS_URL=https://stellar-agents-production.up.railway.app
   ```

3. Redeploy:
   ```bash
   git commit --allow-empty -m "Update backend URLs"
   git push origin main
   ```

---

## 🎯 Phase 4: Verify Production Deployment

### Test Frontend

Visit: https://strapi-template-new-world-kids.vercel.app

**Check these pages:**
- [ ] `/cockpit` - Admin dashboard loads
- [ ] `/cockpit/observability` - Logs page loads
- [ ] `/cockpit/agents/sirius` - Agent detail loads
- [ ] `/impact` - Public dashboard loads
- [ ] `/impact` - Projects display
- [ ] `/impact` - Partnerships display
- [ ] `/impact` - Blog posts display
- [ ] `/blog/<slug>` - Blog detail loads

### Test Backend Services

**Stellar Agents:**
```bash
curl https://stellar-agents-production.up.railway.app/health
# Should return: {"status":"healthy","service":"stellar-agents",...}
```

**Big-3 Orchestrator:**
```bash
curl https://big-3-orchestrator-production.up.railway.app/health
# Should return: {"status":"healthy","service":"big-3-orchestrator",...}
```

### Test Agent Execution

```bash
curl -X POST https://stellar-agents-production.up.railway.app/agents/sirius/execute \
  -H "Content-Type: application/json" \
  -d '{
    "type": "plan_feature",
    "description": "Add a user authentication system"
  }'
```

---

## 🎯 Alternative: Simpler Deployment (Vercel + Supabase Edge Functions)

If Railway is too complex, use **Supabase Edge Functions** for backend:

### Deploy to Supabase Edge Functions

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to project
supabase link --project-ref sbbuxnyvflczfzvsglpe

# Deploy function
supabase functions deploy stellar-agents

# Set secrets
supabase secrets set OPENAI_API_KEY=sk-...
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
supabase secrets set GOOGLE_API_KEY=AIza...
```

**Update Vercel env var:**
```
STELLAR_AGENTS_URL=https://sbbuxnyvflczfzvsglpe.supabase.co/functions/v1/stellar-agents
```

---

## 🎯 Recommended: Railway for Backend

**Pricing:**
- Free: $5/month credit
- Hobby: $5/month (more resources)
- Pro: $20/month (production-ready)

**Pros:**
- Easy GitHub integration
- Auto-deploys on push
- Environment variables UI
- Logs and metrics
- Custom domains

**Cons:**
- Costs money after free tier
- Browser service may need upgrade

---

## 📊 Production Checklist

### Pre-Deployment
- [ ] Both database migrations applied
- [ ] All environment variables documented
- [ ] API keys obtained (OpenAI, Anthropic, Google)
- [ ] Code pushed to GitHub main branch

### Frontend (Vercel)
- [ ] Environment variables set
- [ ] Build succeeds
- [ ] `/cockpit` accessible
- [ ] `/impact` accessible
- [ ] Fonts loading
- [ ] No console errors

### Backend (Railway)
- [ ] Stellar Agents deployed
- [ ] Big-3 Orchestrator deployed
- [ ] Browser Service deployed (optional)
- [ ] DevTools MCP deployed (optional)
- [ ] All health checks return 200

### Database (Supabase)
- [ ] Migrations applied
- [ ] 6 agents seeded
- [ ] 5 projects seeded
- [ ] 5 partnerships seeded
- [ ] 5 blog posts seeded
- [ ] RLS policies active

### Integration
- [ ] Frontend calls backend successfully
- [ ] Agent execution works
- [ ] Logs stream to dashboard
- [ ] Impact stats display correctly
- [ ] Blog posts render

### Performance
- [ ] Lighthouse score > 80
- [ ] No TypeScript errors
- [ ] API response time < 500ms
- [ ] Real-time subscriptions work

---

## 🔧 Troubleshooting

### Vercel Build Fails

**Error:** Module not found
```bash
# Solution: Ensure all dependencies in package.json
cd apps/web
yarn install
git add package.json yarn.lock
git commit -m "Update dependencies"
git push
```

**Error:** Environment variable missing
```bash
# Solution: Add to Vercel dashboard
# https://vercel.com/.../settings/environment-variables
```

### Railway Deployment Fails

**Error:** Port already in use
```bash
# Solution: Railway auto-assigns PORT
# Don't hardcode 3004, use process.env.PORT
```

**Error:** Module not found
```bash
# Solution: Ensure package.json exists in service directory
cd services/stellar-agents
ls package.json  # Should exist
```

### Backend Not Connecting

**Error:** CORS issues
```bash
# Solution: Add Vercel domain to CORS whitelist in backend
# services/stellar-agents/src/server.ts
app.use(cors({
  origin: ['https://strapi-template-new-world-kids.vercel.app']
}));
```

---

## 🎉 Success!

Once everything is deployed, you'll have:

**Frontend URL:**
- https://strapi-template-new-world-kids.vercel.app

**Backend URLs:**
- https://stellar-agents-production.up.railway.app
- https://big-3-orchestrator-production.up.railway.app
- https://browser-service-production.up.railway.app
- https://chrome-devtools-mcp-production.up.railway.app

**Database:**
- https://sbbuxnyvflczfzvsglpe.supabase.co

---

## 💡 Next Steps After Deployment

1. **Custom Domain:** Add your domain to Vercel
2. **SSL:** Vercel handles this automatically
3. **Monitoring:** Set up Sentry for error tracking
4. **Analytics:** Add Vercel Analytics
5. **CDN:** Vercel handles this automatically
6. **Backup:** Supabase handles this automatically

---

## 📞 Quick Commands

```bash
# Redeploy frontend
git push origin main

# Check Vercel deployment
vercel --prod

# Check Railway deployment
railway status

# View Railway logs
railway logs

# View Vercel logs
vercel logs
```

---

**Deployment Time Estimate:**
- Frontend (Vercel): 5 minutes
- Backend (Railway): 20 minutes (4 services)
- Testing: 10 minutes
- **Total: ~35 minutes**

---

Let's deploy! 🚀
