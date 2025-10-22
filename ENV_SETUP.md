# 🔐 Environment Variables Setup Guide

Complete guide to setting up environment variables for all services.

---

## 📋 Required API Keys

Before deployment, obtain these API keys:

### 1. OpenAI API Key
- **Get it from:** https://platform.openai.com/api-keys
- **Used by:** Stellar Agents, Big-3 Orchestrator
- **Format:** `sk-proj-...` (starts with `sk-proj-` or `sk-`)
- **Cost:** Pay-as-you-go (GPT-4 Turbo, GPT-4o Realtime)

### 2. Anthropic API Key
- **Get it from:** https://console.anthropic.com/settings/keys
- **Used by:** Stellar Agents, Big-3 Orchestrator
- **Format:** `sk-ant-...` (starts with `sk-ant-`)
- **Cost:** Pay-as-you-go (Claude 3.5 Sonnet)

### 3. Google AI API Key
- **Get it from:** https://aistudio.google.com/app/apikey
- **Used by:** Stellar Agents, Big-3 Orchestrator
- **Format:** `AIza...` (starts with `AIza`)
- **Cost:** Free tier available (Gemini 2.0 Flash)

### 4. Supabase Keys
- **Get it from:** https://supabase.com/dashboard/project/sbbuxnyvflczfzvsglpe/settings/api
- **Already set up:** `https://sbbuxnyvflczfzvsglpe.supabase.co`
- **Keys needed:**
  - `NEXT_PUBLIC_SUPABASE_URL` - Public URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Anonymous key (safe for client)
  - `SUPABASE_SERVICE_ROLE_KEY` - Service role key (backend only, keep secret!)

---

## 🌍 Environment File Templates

### Frontend (.env.production)

Create `apps/web/.env.production`:

```bash
# Supabase (Public - safe for client)
NEXT_PUBLIC_SUPABASE_URL=https://sbbuxnyvflczfzvsglpe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Backend Service URLs (update after deploying services)
STELLAR_AGENTS_URL=http://localhost:3004
BIG_3_ORCHESTRATOR_URL=http://localhost:3010
BROWSER_SERVICE_URL=http://localhost:3013
CHROME_DEVTOOLS_MCP_URL=http://localhost:3014

# Skip env validation for build
SKIP_ENV_VALIDATION=1
```

### Stellar Agents (.env)

Create `services/stellar-agents/.env`:

```bash
# Server
PORT=3004
NODE_ENV=production

# Supabase (Backend - use service role key)
SUPABASE_URL=https://sbbuxnyvflczfzvsglpe.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# AI Models
OPENAI_API_KEY=sk-proj-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AIza...

# CORS
ALLOWED_ORIGINS=https://strapi-template-new-world-kids.vercel.app,http://localhost:3000
```

### Big-3 Orchestrator (.env)

Create `services/big-3-orchestrator/.env`:

```bash
# Server
PORT=3010
NODE_ENV=production

# AI Models
OPENAI_API_KEY=sk-proj-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AIza...

# CORS
ALLOWED_ORIGINS=https://strapi-template-new-world-kids.vercel.app,http://localhost:3000
```

### Browser Service (.env)

Create `services/browser-service/.env`:

```bash
# Server
PORT=3013
NODE_ENV=production

# Playwright
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium-browser

# CORS
ALLOWED_ORIGINS=https://strapi-template-new-world-kids.vercel.app,http://localhost:3000
```

### Chrome DevTools MCP (.env)

Create `services/chrome-devtools-mcp/.env`:

```bash
# Server
PORT=3014
NODE_ENV=production

# CORS
ALLOWED_ORIGINS=https://strapi-template-new-world-kids.vercel.app,http://localhost:3000
```

---

## ☁️ Vercel Environment Variables

Go to: https://vercel.com/jeremy-bowers-s-projects/strapi-template-new-world-kids/settings/environment-variables

### Add These Variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://sbbuxnyvflczfzvsglpe.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Production, Preview, Development |
| `STELLAR_AGENTS_URL` | `https://stellar-agents-production.up.railway.app` | Production |
| `STELLAR_AGENTS_URL` | `http://localhost:3004` | Development |
| `SKIP_ENV_VALIDATION` | `1` | Production, Preview, Development |

**Important:**
- Use Production URLs for Railway services after deployment
- Use `localhost` URLs for local development
- Never commit `.env` files to git!

---

## 🚂 Railway Environment Variables

For each Railway service, set these via dashboard or CLI:

### Stellar Agents Service

```bash
railway variables set PORT=3004
railway variables set NODE_ENV=production
railway variables set SUPABASE_URL=https://sbbuxnyvflczfzvsglpe.supabase.co
railway variables set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
railway variables set OPENAI_API_KEY=sk-proj-...
railway variables set ANTHROPIC_API_KEY=sk-ant-...
railway variables set GOOGLE_API_KEY=AIza...
railway variables set ALLOWED_ORIGINS=https://strapi-template-new-world-kids.vercel.app
```

### Big-3 Orchestrator Service

```bash
railway variables set PORT=3010
railway variables set NODE_ENV=production
railway variables set OPENAI_API_KEY=sk-proj-...
railway variables set ANTHROPIC_API_KEY=sk-ant-...
railway variables set GOOGLE_API_KEY=AIza...
railway variables set ALLOWED_ORIGINS=https://strapi-template-new-world-kids.vercel.app
```

### Browser Service

```bash
railway variables set PORT=3013
railway variables set NODE_ENV=production
railway variables set PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium-browser
railway variables set ALLOWED_ORIGINS=https://strapi-template-new-world-kids.vercel.app
```

### Chrome DevTools MCP

```bash
railway variables set PORT=3014
railway variables set NODE_ENV=production
railway variables set ALLOWED_ORIGINS=https://strapi-template-new-world-kids.vercel.app
```

---

## 🔒 Security Best Practices

### ⚠️ Never Commit Secrets

Add to `.gitignore`:

```
.env
.env.*
!.env.example
```

### 🔑 Key Rotation

- Rotate API keys every 90 days
- Use different keys for dev/staging/production
- Revoke keys immediately if compromised

### 🛡️ Access Control

**Supabase Service Role Key:**
- Keep SECRET - never expose to client
- Only use in backend services
- Can bypass Row Level Security

**Supabase Anon Key:**
- Safe to expose in frontend
- Subject to Row Level Security
- Public read-only access

### 🌐 CORS Configuration

Update `ALLOWED_ORIGINS` in each service to match your domains:

```bash
# Local development
ALLOWED_ORIGINS=http://localhost:3000

# Production
ALLOWED_ORIGINS=https://strapi-template-new-world-kids.vercel.app

# Multiple domains
ALLOWED_ORIGINS=https://strapi-template-new-world-kids.vercel.app,https://custom-domain.com
```

---

## ✅ Verification Checklist

Before deploying, verify:

- [ ] All API keys obtained
- [ ] Supabase project accessible
- [ ] `.env` files created for all services
- [ ] Environment variables set in Vercel
- [ ] `.gitignore` includes `.env*`
- [ ] No secrets committed to git
- [ ] CORS origins configured correctly

---

## 🔧 Troubleshooting

### Issue: Supabase connection fails

**Check:**
```bash
# Test Supabase API endpoint
curl https://sbbuxnyvflczfzvsglpe.supabase.co/rest/v1/

# Should return 401 (unauthorized) - that's good, means it's reachable
```

**Fix:**
- Verify `SUPABASE_URL` is correct
- Check if project is paused (free tier)
- Confirm API keys are valid

### Issue: OpenAI API returns 401

**Check:**
```bash
# Test OpenAI API key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

**Fix:**
- Verify API key format: `sk-proj-...` or `sk-...`
- Check if key is active (not revoked)
- Ensure billing is set up

### Issue: Anthropic API returns 401

**Check:**
```bash
# Test Anthropic API key
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01"
```

**Fix:**
- Verify API key format: `sk-ant-...`
- Check if key is active
- Ensure you accepted terms of service

### Issue: CORS errors in browser

**Symptoms:**
- `Access-Control-Allow-Origin` errors in console
- Frontend can't reach backend

**Fix:**
```bash
# Update ALLOWED_ORIGINS in backend services
ALLOWED_ORIGINS=https://your-vercel-domain.vercel.app

# Restart services after changing
```

---

## 📞 Quick Reference

### Get Supabase Keys

```bash
# Via Supabase dashboard
https://supabase.com/dashboard/project/sbbuxnyvflczfzvsglpe/settings/api

# Or via CLI
supabase status
```

### Test API Keys

```bash
# OpenAI
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Anthropic
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-3-5-sonnet-20241022","max_tokens":1024,"messages":[{"role":"user","content":"test"}]}'

# Google AI
curl "https://generativelanguage.googleapis.com/v1/models?key=$GOOGLE_API_KEY"
```

### Update Railway Variables

```bash
# List current variables
railway variables

# Set new variable
railway variables set KEY=value

# Delete variable
railway variables delete KEY
```

---

## 🎯 Next Steps

Once all environment variables are set:

1. **Local Testing:**
   ```bash
   ./deploy.sh local
   node verify-deployment.js local
   ```

2. **Production Deployment:**
   ```bash
   ./deploy.sh railway
   node verify-deployment.js production
   ```

3. **Update Vercel:**
   - Add Railway URLs to Vercel env vars
   - Redeploy frontend

---

**Need Help?**
- Check `.env.example` files for reference
- Review `PRODUCTION_DEPLOYMENT.md` for full guide
- Verify API key formats and permissions
