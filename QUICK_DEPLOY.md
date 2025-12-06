# Quick Deploy Guide - Railway Zero-Secrets

## 🚀 Deploy in 5 Minutes

### Prerequisites
- Railway account: https://railway.app (free)
- Git installed
- Node.js 22.x installed

### Step 1: Install Railway CLI
```bash
npm i -g @railway/cli
```

### Step 2: Login
```bash
railway login
```

### Step 3: Initialize Project
```bash
cd strapi-template-new-world-kids
railway init
# Select: Create new project
```

### Step 4: Add Database
```bash
railway add --plugin postgresql
```

### Step 5: Set Secrets
```bash
# Generate and set admin JWT
railway variables set STRAPI_ADMIN_JWT=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# Set environment
railway variables set NODE_ENV=production
```

### Step 6: Deploy
```bash
railway up
```

### Step 7: Get URL
```bash
railway domain
```

**Done!** Your app is live at `https://your-app.up.railway.app`

---

## 🔧 Common Commands

```bash
# View logs
railway logs

# Check status
railway status

# Set variable
railway variables set KEY=value

# Open dashboard
railway open

# Redeploy
railway up

# Rollback
railway rollback
```

---

## 📋 Environment Variables Quick Reference

### Required (Minimum)
```bash
NODE_ENV=production
STRAPI_ADMIN_JWT=<generate>
DATABASE_URL=<auto-set by Railway PostgreSQL plugin>
```

### Optional - Enable as Needed
See `.agents` file for complete list of optional integrations.

**Example - Enable Redis:**
```bash
railway add --plugin redis
railway up
```

**Example - Enable Supabase:**
```bash
railway variables set NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
railway variables set SUPABASE_SERVICE_ROLE_KEY=your-key
railway up
```

---

## 🆘 Troubleshooting

### Build Fails
```bash
# Clear cache and redeploy
railway service remove --cache
railway up
```

### Can't Connect to Database
```bash
# Verify PostgreSQL plugin is added
railway add --plugin postgresql
# Check DATABASE_URL is set
railway variables list | grep DATABASE_URL
```

### App Crashes on Start
```bash
# Check logs
railway logs --tail 100
# Common fix: Ensure PORT is not hardcoded
# Railway sets PORT automatically
```

### Free Tier Exceeded
```bash
# Check usage
railway status
# Options:
# 1. Upgrade plan
# 2. Optimize resources
# 3. Migrate to Coolify (see COOLIFY_MIGRATION.md)
```

---

## 📚 Full Documentation

- **Complete Guide**: `RAILWAY_ZERO_SECRETS_DEPLOYMENT.md`
- **Secret Management**: `.agents` and `master.secrets.json`
- **Cost Protection**: `railway.toml` configuration
- **Migration**: `COOLIFY_MIGRATION.md`
- **Architecture**: `DEPLOYMENT_ARCHITECTURE.md`

---

## 💡 Pro Tips

1. **Monitor Usage**: Check Railway dashboard weekly
2. **Enable Auto-Sleep**: Already configured in `railway.toml`
3. **Use Staging**: Create separate Railway environment for testing
4. **Backup Database**: Schedule regular backups with `railway run pg_dump`
5. **Watch Logs**: `railway logs --follow` during deployment

---

## 🎯 Success Checklist

After deployment, verify:
- [ ] Can access `https://your-app.up.railway.app/admin`
- [ ] Admin panel loads (may need first-time setup)
- [ ] No errors in logs: `railway logs`
- [ ] Database connected (check admin panel content types)
- [ ] Health check passing (railway dashboard)

---

**Need help?** See full documentation or open an issue.
