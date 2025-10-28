# 🚀 Deploy to Vercel NOW - Quick Checklist

**Time Required**: 5 minutes
**Status**: Ready to deploy!

---

## ✅ 4 Required Steps Only

### Step 1: Get Supabase Keys (2 minutes)

1. Open: https://supabase.com/dashboard/project/sbbuxnyvflczfzvsglpe
2. Click: **Settings** (gear icon) → **API**
3. **Copy 2 keys**:

**Copy This** → Anon Key (public):
```
Starts with: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Copy This** → Service Role Key (secret):
```
Starts with: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
(will be longer than anon key)
```

---

### Step 2: Open Vercel Settings (1 minute)

1. Go to: https://vercel.com/dashboard
2. Find project: **strapi-template-new-world-kids**
3. Click: **Settings** → **Environment Variables**

---

### Step 3: Add 4 Variables (2 minutes)

**For EACH variable below**:
- Click "Add New"
- Paste Key name
- Paste Value
- Select: ✅ Production ✅ Preview ✅ Development
- Click "Save"

---

#### Variable 1:
```
Key:   NEXT_PUBLIC_SUPABASE_URL
Value: https://sbbuxnyvflczfzvsglpe.supabase.co
```

#### Variable 2:
```
Key:   NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: <PASTE YOUR ANON KEY FROM STEP 1>
```

#### Variable 3:
```
Key:   SUPABASE_URL
Value: https://sbbuxnyvflczfzvsglpe.supabase.co
```

#### Variable 4:
```
Key:   SUPABASE_SERVICE_ROLE_KEY
Value: <PASTE YOUR SERVICE_ROLE KEY FROM STEP 1>
```

---

### Step 4: Redeploy (30 seconds)

**Option A**: Push a commit (easiest)
```bash
# Any small change will trigger redeploy
git commit --allow-empty -m "Trigger redeploy with env vars"
git push origin main
```

**Option B**: Manual redeploy
1. Click "Deployments" tab in Vercel
2. Find latest deployment
3. Click "..." → "Redeploy"

---

## ⏱️ Wait for Build (3-5 minutes)

Vercel will:
1. ✅ Pull latest code from GitHub
2. ✅ Install dependencies (yarn install)
3. ✅ Build Next.js app (turbo run build)
4. ✅ Deploy to edge network

**Watch progress**: https://vercel.com/dashboard (Deployments tab)

---

## 🎉 Success Indicators

When deployment is complete:
- Status shows: **"Ready"** ✅
- You get a URL: `https://your-project.vercel.app`
- Click URL → App loads
- No errors in browser console

---

## 🔍 Quick Test

After deployment succeeds:

1. **Visit your URL**
2. **Open browser console** (F12)
3. **Check for errors** - should see none
4. **Test Supabase** - run in console:
```javascript
// Should not error
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
```

---

## ❌ If Build Fails

Check Vercel build logs for:

**"Missing environment variables"**
→ Add all 4 variables from Step 3

**"Module not found"**
→ Should auto-fix - dependencies in package.json

**"Supabase error"**
→ Check keys are correct (anon vs service_role)

**Other errors**
→ Check full guide: `VERCEL_ENV_SETUP.md`

---

## 📋 What's Already Done

✅ Turborepo configured
✅ Vercel build settings correct
✅ package.json has all core dependencies
✅ Supabase clients created
✅ Code pushed to GitHub
✅ Vercel project linked

**Only thing missing**: Your Supabase API keys!

---

## 🎯 After Successful Deploy

### Immediate Next Steps:
1. Set up database tables (SQL in `docs/DEPLOYMENT_SETUP.md`)
2. Enable Row Level Security
3. Test Supabase connection

### This Week:
1. Install animation libraries (framer-motion, gsap, three.js)
2. Test Hero3D component
3. Start implementing computer control service

---

## 🆘 Need Help?

- **Full Guide**: See `VERCEL_ENV_SETUP.md`
- **Deployment Docs**: See `docs/DEPLOYMENT_SETUP.md`
- **Architecture**: See `docs/AWWWARDS_ARCHITECTURE.md`

---

**🚀 Ready? Let's deploy!**

1. Get Supabase keys
2. Add to Vercel
3. Redeploy
4. Wait 5 minutes
5. Success! ✅
