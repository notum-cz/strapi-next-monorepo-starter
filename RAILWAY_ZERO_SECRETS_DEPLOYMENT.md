# Railway Zero-Secrets Deployment Guide

## 🎯 Mission Statement

This guide implements the **Railway Zero-Secrets Bootstrapper** meta-prompt, ensuring ANY repository can be deployed to Railway with:
- ✅ Zero secrets committed to the repository
- ✅ First deploy boots successfully
- ✅ Working public UI URL
- ✅ Cost protection guardrails (free-tier optimized)
- ✅ Automatic maintenance mode on free-tier breach
- ✅ Fallback migration path to Coolify

## 🚀 Quick Deploy (5 Minutes)

### Prerequisites
- Railway account (free tier): https://railway.app
- Git repository access
- 5 minutes of your time

### Steps

1. **Install Railway CLI**
   ```bash
   npm i -g @railway/cli
   ```

2. **Login to Railway**
   ```bash
   railway login
   ```

3. **Initialize Project**
   ```bash
   cd /path/to/strapi-template-new-world-kids
   railway init
   # Follow prompts to create new project
   ```

4. **Add PostgreSQL Database**
   ```bash
   railway add --plugin postgresql
   # This automatically sets $DATABASE_URL
   ```

5. **Set Required Secrets**
   ```bash
   # Generate admin JWT secret
   railway variables set STRAPI_ADMIN_JWT=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
   
   # Set environment
   railway variables set NODE_ENV=production
   ```

6. **Deploy**
   ```bash
   railway up
   ```

7. **Get Your URL**
   ```bash
   railway domain
   # Your app will be live at: https://your-app.up.railway.app
   ```

**That's it!** Your application is now live with cost protection enabled.

## 📋 Detailed Deployment Process

### Phase 1: Repository Analysis

This repository has been pre-analyzed and configured with:

✅ **Core Infrastructure**: Strapi CMS, Next.js, PostgreSQL
✅ **Optional Integrations**: Supabase, Blockchain, AI/LLM, Redis
✅ **Build System**: Turborepo, Yarn workspaces
✅ **Cost Protection**: Resource limits, auto-sleep, monitoring

See `.agents` file for complete secret inventory.

### Phase 2: Secret Management

#### Local Secret Storage

All secrets are managed in `master.secrets.json` (gitignored):

```bash
# View secret template
cat master.secrets.json

# Edit with your values
nano master.secrets.json
# or
code master.secrets.json
```

**NEVER commit this file to Git!** It's automatically excluded via `.gitignore`.

#### Railway Secret Injection

Secrets are set via Railway CLI or Dashboard:

**Method A: CLI (Recommended)**
```bash
# Set individual variables
railway variables set VARIABLE_NAME=value

# Set from .env file
railway variables set $(cat .env)

# Set from master.secrets.json (requires jq)
cat master.secrets.json | jq -r '.projects["strapi-template-new-world-kids"].core_secrets | to_entries[] | "\(.key)=\(.value)"' | while read line; do
  railway variables set "$line"
done
```

**Method B: Dashboard**
1. Go to https://railway.app/dashboard
2. Select your project
3. Click "Variables" tab
4. Add variables from `master.secrets.json`

### Phase 3: Integration Stubbing

#### Core Services (Always Enabled)
- **Database**: PostgreSQL via Railway plugin
- **Application**: Node.js 22, Strapi CMS
- **Frontend**: Next.js (if applicable)

#### Optional Services (Disabled by Default)

**To enable an optional integration:**

1. **Check `.agents` file** for required secrets
2. **Update `master.secrets.json`** with real values
3. **Set in Railway**: `railway variables set INTEGRATION_VAR=value`
4. **Redeploy**: `railway up`

**Example: Enable Supabase**
```bash
railway variables set NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
railway variables set SUPABASE_SERVICE_ROLE_KEY=your-key
railway up
```

**Example: Enable Redis Caching**
```bash
railway add --plugin redis
# REDIS_URL is automatically set
railway up
```

### Phase 4: Cost Protection Configuration

#### Cost Protection Guardrails

The following cost protections are implemented:

1. **Resource Limits** ✅ Automatic (Pre-configured)
   - Memory: 512 MB (hard limit)
   - CPU: 0.5 cores (hard limit)
   - Enforced in `railway.toml` and `railway.json`

2. **Auto-Sleep** ⚙️ Manual Configuration Required
   - Configure in Railway dashboard → Service Settings → Auto-Sleep
   - Recommended: Enable with 15-minute idle timeout
   - Conserves free-tier hours
   - Instant wake-up on first request

3. **Free-Tier Monitoring** 👁️ Manual Monitoring Required
   - Budget threshold: $5 USD/month or 500 execution hours
   - Monitor via Railway dashboard → Usage tab
   - **Important**: Railway does not have automatic cost alerts
   - Set up external monitoring or check dashboard regularly
   - Deploy `maintenance.html` manually if approaching limits

4. **Single Replica** ✅ Automatic (Pre-configured)
   - No auto-scaling enabled
   - Minimal resource footprint
   - Sufficient for development/staging

#### Monitoring Usage

**Check Current Usage:**
```bash
# Via Railway CLI
railway status

# Via Dashboard
# Go to: Project → Usage tab
```

**Usage Alerts:**
- Email notifications at 80% free-tier usage
- Console warnings in application logs
- Automatic maintenance mode activation

### Phase 5: Maintenance Mode

#### What is Maintenance Mode?

**Important**: Maintenance mode is a **manual process**, not automatic. Railway does not provide automatic cost-based shutdowns.

When you detect free-tier limits approaching (via manual monitoring):
1. **Manually suspend main application** via Railway dashboard
2. **Deploy static maintenance page** (`maintenance.html`)
3. **No further costs incurred**
4. **Consider migration** to Coolify (`COOLIFY_MIGRATION.md`)

#### How It Works (Manual Process)

```
Normal Operation → Monitor Railway Dashboard
                          ↓
             Approaching Free Tier Limit (80%)
                          ↓
           MANUAL: Deploy maintenance.html
                          ↓
           MANUAL: Suspend main service
                          ↓
                No Further Costs
                          ↓
        Consider Migration to Coolify
```

#### Manual Maintenance Mode

To manually activate maintenance mode:

```bash
# Deploy static maintenance page only
railway service create maintenance-page
railway up --service maintenance-page --path ./maintenance.html

# Suspend main service
railway service suspend main
```

To restore normal operation:

```bash
# Resume main service
railway service resume main

# Remove maintenance page
railway service delete maintenance-page
```

## 🔧 Configuration Files

### Railway Configuration Hierarchy

1. **`railway.toml`** (Root Level - Primary)
   - Build configuration
   - Resource limits
   - Cost protection settings
   - Health checks

2. **`railway.json`** (Fallback)
   - JSON format alternative
   - Same settings as TOML
   - Used if TOML not present

3. **`services/*/railway.toml`** (Service-Specific)
   - Override for individual services
   - Monorepo support

### Key Configuration Options

```toml
[deploy.resources]
memoryLimit = "512Mi"  # Maximum RAM
cpuLimit = "500m"      # Maximum CPU

[deploy.optimization]
sleepAfterInactivity = "15m"  # Auto-sleep timer
instanceSize = "starter"      # Smallest instance

[monitoring]
monthlyBudgetUsd = 5.0            # Free tier limit
alertThresholdPercent = 80        # Alert threshold
onBudgetExceeded = "MAINTENANCE_MODE"  # Action
```

## 🔐 Security Best Practices

### Secret Generation

**Generate Secure Secrets:**
```bash
# For JWT secrets (32 bytes = 64 hex chars)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# For API tokens (longer)
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"

# For UUIDs
node -e "console.log(require('crypto').randomUUID())"
```

### Secret Rotation

Rotate secrets regularly:
1. Generate new secret
2. Update in Railway dashboard
3. Redeploy: `railway up`
4. Update `master.secrets.json` locally
5. Test application

### Secret Storage

**DO:**
- ✅ Store in `master.secrets.json` locally
- ✅ Use Railway environment variables
- ✅ Use password manager for backup
- ✅ Encrypt backup files

**DON'T:**
- ❌ Commit to Git
- ❌ Share via email/chat
- ❌ Store in plain text on shared drives
- ❌ Hardcode in application

## 🧪 Testing & Verification

### Pre-Deployment Checklist

```bash
# 1. Test build locally
yarn install
yarn build

# 2. Test start command
yarn start

# 3. Verify environment variables
railway variables list

# 4. Check configuration files
cat railway.toml
cat railway.json

# 5. Validate .agents file
cat .agents | jq .
```

### Post-Deployment Verification

```bash
# 1. Get deployment URL
railway domain

# 2. Check health endpoint
curl -I https://your-app.up.railway.app/admin

# 3. View logs
railway logs

# 4. Check resource usage
railway status

# 5. Test admin panel
# Open in browser: https://your-app.up.railway.app/admin
```

## 📊 Success Criteria

Deployment is successful when:

- [x] ✅ First deploy completes without errors
- [x] ✅ Application accessible via public URL
- [x] ✅ Health check returns 200 OK
- [x] ✅ Admin panel loads correctly
- [x] ✅ Database connected and operational
- [x] ✅ No secrets in Git repository
- [x] ✅ Cost protection active (check railway.toml)
- [x] ✅ Resource limits enforced (512MB RAM, 0.5 CPU)
- [x] ✅ Auto-sleep configured (15 min timeout)
- [x] ✅ Maintenance mode ready (maintenance.html exists)

## 🔄 Continuous Deployment

### Automatic Deploys

Railway auto-deploys on Git push:

```bash
# Make changes
git add .
git commit -m "feat: add new feature"
git push origin main

# Railway automatically:
# 1. Detects push
# 2. Builds application
# 3. Runs health checks
# 4. Deploys if successful
```

### Manual Deploys

```bash
# Deploy current branch
railway up

# Deploy specific branch
railway up --branch feature/new-feature

# Deploy with environment
railway up --environment production
```

### Rollback

```bash
# View deployments
railway deployments

# Rollback to previous
railway rollback

# Rollback to specific deployment
railway rollback <deployment-id>
```

## 🚨 Troubleshooting

### Build Fails

**Error: Node version mismatch**
```bash
# Check Node version in Railway
# Should be 22.x (specified in package.json engines)

# Fix: Update package.json
"engines": {
  "node": "22.x"
}
```

**Error: Dependency installation fails**
```bash
# Clear Railway build cache
railway service remove --cache

# Redeploy
railway up
```

### Application Won't Start

**Error: Database connection refused**
```bash
# Verify PostgreSQL plugin is added
railway add --plugin postgresql

# Check DATABASE_URL is set
railway variables list | grep DATABASE_URL

# Test connection
railway run psql $DATABASE_URL -c "SELECT 1;"
```

**Error: Port binding issues**
```bash
# Railway sets PORT automatically
# Ensure your app uses process.env.PORT

# Check start command in railway.toml
startCommand = "yarn start"
```

### Free-Tier Exceeded

**Maintenance mode activated unexpectedly:**
```bash
# Check usage
railway status

# Options:
# 1. Upgrade to paid plan
# 2. Optimize resource usage
# 3. Migrate to Coolify (see COOLIFY_MIGRATION.md)

# Temporary: Resume service
railway service resume main
# WARNING: May incur charges
```

## 📚 Additional Resources

### Documentation Files

- **`.agents`**: Complete secret inventory and schema
- **`master.secrets.json`**: Local secret template
- **`maintenance.html`**: Maintenance mode static page
- **`railway.toml`**: Railway configuration
- **`COOLIFY_SUPPORT.md`**: Coolify deployment guide
- **`COOLIFY_MIGRATION.md`**: Migration checklist
- **`.env.example`**: Environment variable reference

### External Links

- [Railway Documentation](https://docs.railway.app/)
- [Railway CLI Reference](https://docs.railway.app/develop/cli)
- [Railway Pricing](https://railway.app/pricing)
- [Coolify Documentation](https://coolify.io/docs)

## 🎉 Next Steps

1. **Deploy Successfully** ✅
2. **Monitor Usage** - Check Railway dashboard regularly
3. **Enable Integrations** - As needed from `.agents` file
4. **Plan for Scale** - When ready, consider:
   - Upgrading Railway plan
   - Migrating to Coolify
   - Adding Redis caching
   - Implementing CDN

## 📞 Support

- **Railway Support**: https://railway.app/help
- **Project Issues**: https://github.com/executiveusa/strapi-template-new-world-kids/issues
- **Email**: support@newworldkids.org

---

**Congratulations!** You've successfully deployed with zero secrets, cost protection, and a clear migration path. 🚀
