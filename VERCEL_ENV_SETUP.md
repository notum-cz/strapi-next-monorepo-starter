# Vercel Environment Variables Setup Guide

**Quick Start**: Copy this guide to set up all environment variables in Vercel for successful deployment.

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Get Your Supabase Keys

1. Go to: https://supabase.com/dashboard/project/sbbuxnyvflczfzvsglpe
2. Click **"Project Settings"** (gear icon in sidebar)
3. Click **"API"** in the left menu
4. Copy these two keys:

**ANON KEY** (public, safe for client-side):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNiYnV4bnl2ZmxjemZ6dnNnbHBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE2...
```

**SERVICE_ROLE KEY** (secret, server-side only):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNiYnV4bnl2ZmxjemZ6dnNnbHBlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY...
```

### Step 2: Add Variables to Vercel

1. Go to: https://vercel.com/dashboard
2. Select your project: **strapi-template-new-world-kids**
3. Click **"Settings"** → **"Environment Variables"**
4. Add each variable below for **all environments** (Production + Preview + Development)

---

## 📋 Required Variables (MUST ADD)

### 1. Supabase URL (Public)
- **Key**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: `https://sbbuxnyvflczfzvsglpe.supabase.co`
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

### 2. Supabase Anon Key (Public)
- **Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: `<paste your ANON key from Step 1>`
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

### 3. Supabase URL (Server)
- **Key**: `SUPABASE_URL`
- **Value**: `https://sbbuxnyvflczfzvsglpe.supabase.co`
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

### 4. Supabase Service Role Key (Secret)
- **Key**: `SUPABASE_SERVICE_ROLE_KEY`
- **Value**: `<paste your SERVICE_ROLE key from Step 1>`
- **Environments**: ✅ Production, ✅ Preview, ✅ Development
- **⚠️ WARNING**: This key gives admin access - keep it secret!

---

## 🎯 Optional Variables (Can Add Later)

### App Configuration
```
NODE_ENV=production
APP_PUBLIC_URL=https://your-project.vercel.app
```

### Feature Flags (Enable/Disable Features)
```
NEXT_PUBLIC_FEATURE_FLAGS=ENABLE_NEW_BRANDING
NEXT_PUBLIC_ENABLE_3D_HERO=true
NEXT_PUBLIC_ENABLE_SMOOTH_SCROLL=true
```

### Strapi CMS (If Deployed)
```
NEXT_PUBLIC_STRAPI_URL=https://your-strapi.railway.app
STRAPI_REST_READONLY_API_KEY=your_readonly_key
```

### Blockchain (Future)
```
NEXT_PUBLIC_SOLANA_NETWORK=devnet
BLOCKCHAIN_SERVICE_URL=https://blockchain.railway.app
```

### AI Agents (Future)
```
AI_AGENTS_SERVICE_URL=https://ai-agents.railway.app
OPENROUTER_API_KEY=sk-or-v1-xxx
```

---

## 📦 Dependencies Already in package.json

These are automatically installed during Vercel build - **NO ACTION NEEDED**:

### Core Framework
- ✅ `next@^15.4.7` - Next.js framework
- ✅ `react@^18.3.1` - React library
- ✅ `react-dom@^18.3.1` - React DOM

### Supabase
- ✅ `@supabase/supabase-js@^2.38.4` - Supabase client (already in package.json)

### Styling
- ✅ `tailwindcss@^4.0.9` - Tailwind CSS
- ✅ `@tailwindcss/postcss@^4.0.9` - PostCSS
- ✅ `tailwind-merge@^3.2.0` - Utility for merging classes

### UI Components
- ✅ `@radix-ui/*` - All Radix UI components
- ✅ `lucide-react@^0.487.0` - Icon library
- ✅ `clsx@^2.1.1` - Class name utility

### Forms & Validation
- ✅ `react-hook-form@^7.53.1` - Form handling
- ✅ `zod@^3.23.8` - Schema validation
- ✅ `@hookform/resolvers@^3.9.1` - Form resolvers

### All other dependencies - see `apps/web/package.json`

---

## 🎨 Animation Dependencies (To Add)

These need to be installed for the 3D hero and animations to work:

```bash
cd apps/web
yarn add framer-motion@^11.0.8
yarn add gsap@^3.12.5 @gsap/react@^2.1.0
yarn add lenis@^1.0.42
yarn add three@^0.160.0
yarn add @react-three/fiber@^8.15.0
yarn add @react-three/drei@^9.92.0
yarn add react-countup@^6.5.0
yarn add sonner@^1.3.1
```

**When to add**: After successful Vercel deployment, commit these to package.json

---

## ✅ Deployment Checklist

### Before Deploying
- [ ] Add all 4 required Supabase variables to Vercel
- [ ] Verify Supabase keys are correct
- [ ] Check that Vercel project ID is correct: `prj_uyBo0MfsraJRp7k7ptUTt9A3vc0t`

### After First Deploy
- [ ] Verify build succeeds (check Vercel dashboard)
- [ ] Test the deployment URL
- [ ] Check that app loads without errors
- [ ] Open browser console - should see no errors

### Database Setup (Next)
- [ ] Run SQL from `docs/DEPLOYMENT_SETUP.md` to create tables
- [ ] Enable Row Level Security policies
- [ ] Enable Realtime for donations_feed table
- [ ] Test Supabase connection from deployed app

### Add Animation Libraries (Later)
- [ ] Install framer-motion, gsap, three.js (see above)
- [ ] Commit updated package.json
- [ ] Push to GitHub - Vercel auto-deploys
- [ ] Test Hero3D component works

---

## 🔧 How to Add Variables in Vercel

### Via Vercel Dashboard

1. **Navigate**:
   - Go to https://vercel.com/dashboard
   - Click on your project
   - Click "Settings" tab
   - Click "Environment Variables" in sidebar

2. **Add Variable**:
   - Click "Add New"
   - Enter **Key** (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
   - Enter **Value** (e.g., `https://sbbuxnyvflczfzvsglpe.supabase.co`)
   - Select environments: ✅ Production ✅ Preview ✅ Development
   - Click "Save"

3. **Repeat** for all 4 required variables

4. **Redeploy**:
   - Go to "Deployments" tab
   - Click "..." on latest deployment
   - Click "Redeploy"
   - OR just push a new commit to trigger deployment

### Via Vercel CLI (Alternative)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Paste value when prompted: https://sbbuxnyvflczfzvsglpe.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Paste your anon key

vercel env add SUPABASE_URL production
# Paste value: https://sbbuxnyvflczfzvsglpe.supabase.co

vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Paste your service_role key

# Trigger deployment
vercel --prod
```

---

## 🚨 Common Errors & Solutions

### Error: "Missing environment variables"
**Solution**: Add all 4 required Supabase variables to Vercel

### Error: "Module not found: @supabase/supabase-js"
**Solution**: Already in package.json - should auto-install. If not, add manually:
```json
"@supabase/supabase-js": "^2.38.4"
```

### Error: "Supabase client initialization failed"
**Solution**: Check that anon key is correct and project URL matches

### Error: "Build failed: turbo not found"
**Solution**: Already fixed! Turbo is in package.json devDependencies

### Error: "Cannot find module 'framer-motion'"
**Solution**: These aren't critical yet - app will deploy without animations. Add later.

---

## 📊 Environment Variables Summary

### Absolutely Required (4 variables)
1. `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public Supabase key
3. `SUPABASE_URL` - Same as #1, for server-side
4. `SUPABASE_SERVICE_ROLE_KEY` - Admin Supabase key

### Optional But Recommended
- `NODE_ENV=production` - Environment indicator
- `APP_PUBLIC_URL` - Your app's URL
- `NEXT_PUBLIC_FEATURE_FLAGS` - Enable/disable features

### For Future Implementation
- Strapi CMS variables (when CMS is deployed)
- Blockchain variables (when blockchain service is deployed)
- AI variables (when AI agents service is deployed)
- Analytics (Google Analytics, etc.)
- Monitoring (Sentry, etc.)

---

## 🎯 Quick Copy-Paste Template

Copy this to a text file, fill in your keys, then add to Vercel:

```
# REQUIRED VARIABLES - ADD THESE TO VERCEL NOW

NEXT_PUBLIC_SUPABASE_URL=https://sbbuxnyvflczfzvsglpe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<YOUR_ANON_KEY_HERE>
SUPABASE_URL=https://sbbuxnyvflczfzvsglpe.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<YOUR_SERVICE_ROLE_KEY_HERE>

# OPTIONAL - CAN ADD LATER

NODE_ENV=production
APP_PUBLIC_URL=https://your-project.vercel.app
NEXT_PUBLIC_FEATURE_FLAGS=ENABLE_NEW_BRANDING
```

---

## 🔗 Important Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://supabase.com/dashboard/project/sbbuxnyvflczfzvsglpe
- **Supabase API Settings**: https://supabase.com/dashboard/project/sbbuxnyvflczfzvsglpe/settings/api
- **GitHub Repo**: https://github.com/executiveusa/strapi-template-new-world-kids

---

## ✅ Success Indicators

After adding variables and deploying, you should see:
- ✅ Build completes successfully (3-5 minutes)
- ✅ Deployment shows "Ready" status
- ✅ Visit URL - app loads without errors
- ✅ Browser console - no Supabase errors
- ✅ Network tab - Supabase requests succeed

---

**Next Steps After Successful Deploy:**
1. Set up Supabase database (run SQL from DEPLOYMENT_SETUP.md)
2. Install animation dependencies
3. Test the Hero3D component
4. Start implementing Week 1 features

🚀 **Your app is ready to deploy!**
