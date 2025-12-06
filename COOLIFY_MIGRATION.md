# Coolify Migration Checklist

This document provides a step-by-step migration plan from Railway to Coolify, triggered automatically when free-tier limits are reached or when manual migration is desired.

## 🎯 Migration Overview

**When to Migrate:**
- Railway free-tier usage exceeds 80% threshold
- Automatic maintenance mode has been activated
- Manual decision to move to self-hosted infrastructure
- Need for more control over hosting environment

**Migration Time:** ~2-4 hours (including DNS propagation)

**Downtime:** ~15-30 minutes (can be reduced with proper planning)

## ✅ Pre-Migration Checklist

### Phase 1: Preparation (Before Starting Migration)

- [ ] **Review Current Railway Setup**
  - [ ] Document all environment variables in Railway
  - [ ] List all connected Railway plugins (PostgreSQL, Redis, etc.)
  - [ ] Note current resource usage and performance metrics
  - [ ] Export Railway configuration

- [ ] **Prepare Coolify Environment**
  - [ ] Coolify instance installed and accessible
  - [ ] Domain/subdomain configured and pointing to Coolify server
  - [ ] SSL certificate ready or Let's Encrypt configured
  - [ ] SSH access to Coolify server confirmed

- [ ] **Database Backup**
  - [ ] Create full PostgreSQL backup from Railway
  - [ ] Verify backup integrity
  - [ ] Store backup in secure location
  - [ ] Document database schema version

- [ ] **Secret Management**
  - [ ] Update `master.secrets.json` with all current secrets
  - [ ] Generate new secrets for Coolify environment (optional but recommended)
  - [ ] Verify all API keys and tokens are documented
  - [ ] Test database connection strings

- [ ] **Communication**
  - [ ] Notify users of planned maintenance (if applicable)
  - [ ] Prepare status page update
  - [ ] Set up monitoring alerts for migration

## 📋 Migration Steps

### Phase 2: Database Migration

#### Step 1: Export Railway Database

```bash
# Connect to Railway PostgreSQL
railway login
railway link

# Export database
railway run pg_dump $DATABASE_URL > railway-backup-$(date +%Y%m%d-%H%M%S).sql

# Verify backup file
ls -lh railway-backup-*.sql
head -n 50 railway-backup-*.sql
```

**Verification Checklist:**
- [ ] Backup file created successfully
- [ ] File size is reasonable (non-zero)
- [ ] File contains SQL commands
- [ ] Backup includes all tables and data

#### Step 2: Set Up Coolify Database

```bash
# Option A: Use Coolify's PostgreSQL
# In Coolify dashboard:
# 1. Add Resource → Database → PostgreSQL
# 2. Name: newworldkids-db
# 3. Note connection details

# Option B: Connect to existing PostgreSQL
# Configure connection string in environment variables
```

**Database Setup Checklist:**
- [ ] PostgreSQL instance created/connected
- [ ] Database credentials documented
- [ ] Connection string tested
- [ ] Database accessible from Coolify application

#### Step 3: Import Data to Coolify

```bash
# SSH to Coolify server
ssh user@coolify-server

# Upload backup file
scp railway-backup-*.sql user@coolify-server:/tmp/

# Import to PostgreSQL
psql $DATABASE_URL < /tmp/railway-backup-*.sql

# Verify import
psql $DATABASE_URL -c "SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public';"
```

**Import Verification:**
- [ ] All tables imported successfully
- [ ] Row counts match source database
- [ ] Indexes and constraints created
- [ ] No error messages in import log

### Phase 3: Application Deployment

#### Step 4: Configure Coolify Application

```bash
# In Coolify dashboard:

# 1. Create new Application
#    - Type: Git Repository
#    - Repository: https://github.com/executiveusa/strapi-template-new-world-kids.git
#    - Branch: main

# 2. Build Configuration
#    - Build Pack: nixpacks
#    - Base Directory: /
#    - Build Command: yarn install && yarn build
#    - Start Command: yarn start
#    - Port: 1337

# 3. Health Check
#    - Path: /admin
#    - Port: 1337
#    - Interval: 30s
```

**Application Configuration Checklist:**
- [ ] Repository connected
- [ ] Build commands configured
- [ ] Start command set
- [ ] Port mapping configured
- [ ] Health check path set

#### Step 5: Set Environment Variables

Use `master.secrets.json` as reference. Set these in Coolify:

```bash
# Core Variables
NODE_ENV=production
PORT=1337
DATABASE_URL=<coolify-postgres-url>
STRAPI_ADMIN_JWT=<from-master-secrets>
STRAPI_TOKEN=<from-master-secrets>

# Public URLs (Update with Coolify domain)
APP_PUBLIC_URL=https://newworldkids.yourdomain.com
NEXT_PUBLIC_STRAPI_URL=https://api.yourdomain.com
STRAPI_URL=http://localhost:1337

# Optional integrations (copy from Railway as needed)
SUPABASE_URL=<if-enabled>
REDIS_URL=<if-enabled>
# ... etc
```

**Environment Variables Checklist:**
- [ ] All required core variables set
- [ ] Database URL updated to Coolify PostgreSQL
- [ ] Public URLs updated to new domain
- [ ] Optional integrations configured
- [ ] All secrets from Railway transferred
- [ ] No placeholder values remaining

#### Step 6: Initial Deployment

```bash
# In Coolify dashboard:
# Click "Deploy" button

# Monitor build logs for:
# - Successful dependency installation
# - Clean build completion
# - Application start without errors
# - Health check passing
```

**Deployment Verification:**
- [ ] Build completed successfully
- [ ] No build errors or warnings
- [ ] Container started
- [ ] Health check passing
- [ ] Application logs look normal

### Phase 4: Testing & Verification

#### Step 7: Functional Testing

```bash
# Test 1: Admin panel access
curl -I https://newworldkids.yourdomain.com/admin
# Expected: 200 OK

# Test 2: Database connectivity
# Login to admin panel
# Verify content is visible

# Test 3: API endpoints
curl https://api.yourdomain.com/api/health
# Expected: {"status": "ok"}
```

**Functional Test Checklist:**
- [ ] Admin panel loads correctly
- [ ] Can login with existing credentials
- [ ] All content types visible
- [ ] Media files accessible
- [ ] API endpoints responding
- [ ] Authentication working
- [ ] No console errors in browser

#### Step 8: Performance Testing

```bash
# Load testing (optional but recommended)
# Install wrk or ab tool
wrk -t2 -c10 -d30s https://newworldkids.yourdomain.com

# Check metrics:
# - Response time < 500ms
# - No 500 errors
# - Consistent performance
```

**Performance Metrics:**
- [ ] Average response time acceptable
- [ ] No timeout errors
- [ ] Memory usage stable
- [ ] CPU usage reasonable
- [ ] Database queries efficient

### Phase 5: DNS Cutover

#### Step 9: Update DNS Records

```bash
# In your DNS provider (e.g., Cloudflare, Namecheap):

# 1. Update A record
#    Type: A
#    Name: @ (or subdomain)
#    Value: <coolify-server-ip>
#    TTL: 300 (5 minutes)

# 2. Update API subdomain (if separate)
#    Type: A
#    Name: api
#    Value: <coolify-server-ip>
#    TTL: 300

# 3. Lower TTL before change (recommended)
#    Set TTL to 300 seconds 24 hours before migration
#    Allows faster rollback if needed
```

**DNS Update Checklist:**
- [ ] Old TTL reduced to 5 minutes (done 24h before)
- [ ] New A record configured
- [ ] DNS changes saved
- [ ] DNS propagation monitored
- [ ] Can access via new IP

#### Step 10: DNS Propagation Monitoring

```bash
# Check DNS propagation
dig newworldkids.yourdomain.com +short
# Should return Coolify server IP

# Check from multiple locations
# Use: https://www.whatsmydns.net/

# Test SSL
curl -I https://newworldkids.yourdomain.com
# Should show valid SSL certificate
```

**DNS Verification:**
- [ ] DNS resolves to new IP
- [ ] Propagation complete (check multiple DNS servers)
- [ ] SSL certificate issued and valid
- [ ] HTTPS working correctly
- [ ] No mixed content warnings

### Phase 6: Post-Migration

#### Step 11: Final Verification

```bash
# Comprehensive health check
# 1. Admin panel access
# 2. Create/edit/delete content
# 3. Upload media file
# 4. Test API endpoints
# 5. Check all integrations
# 6. Verify scheduled jobs (if any)
```

**Final Verification Checklist:**
- [ ] All admin functions working
- [ ] Content creation/editing successful
- [ ] Media uploads working
- [ ] All API endpoints tested
- [ ] Authentication functioning
- [ ] Integrations (Supabase, etc.) connected
- [ ] Background jobs running
- [ ] Monitoring alerts configured
- [ ] Backup job scheduled

#### Step 12: Railway Cleanup

```bash
# DO NOT DELETE until 100% confident migration successful
# Recommended: Keep Railway running for 7 days

# After confidence period:
# 1. Export final Railway logs
railway logs > railway-final-logs-$(date +%Y%m%d).txt

# 2. Document final state
railway status > railway-final-status.txt

# 3. Delete Railway service (in Railway dashboard)
#    - Go to project settings
#    - Click "Delete Service"
#    - Confirm deletion

# 4. Cancel Railway PostgreSQL plugin
```

**Cleanup Checklist:**
- [ ] Migration stable for 7+ days
- [ ] No issues reported
- [ ] Railway logs exported
- [ ] Railway configuration documented
- [ ] Railway service deleted
- [ ] Railway plugins removed
- [ ] No remaining Railway charges
- [ ] Update documentation

#### Step 13: Update Documentation

```bash
# Update repository documentation
# 1. README.md - Update deployment instructions
# 2. DEPLOYMENT.md - Add Coolify section
# 3. .env.example - Update with Coolify URLs
# 4. This file - Mark migration as complete
```

**Documentation Updates:**
- [ ] README.md updated
- [ ] DEPLOYMENT.md includes Coolify
- [ ] Environment variable examples updated
- [ ] Migration date documented
- [ ] New deployment process documented
- [ ] Troubleshooting section updated

## 🔄 Rollback Plan

If migration fails or issues arise:

### Immediate Rollback (Within DNS TTL period)

```bash
# 1. Revert DNS records to Railway IPs
#    Change A record back to Railway IP

# 2. Keep Railway service running
#    Do not delete until migration confirmed successful

# 3. Monitor Railway service
#    Ensure it's still functioning

# 4. Debug Coolify issues offline
#    Fix problems without affecting production
```

**Rollback Checklist:**
- [ ] DNS reverted to Railway
- [ ] Railway service still running
- [ ] Users can access application
- [ ] Document rollback reason
- [ ] Plan next migration attempt

### Extended Rollback (After DNS fully propagated)

If issues discovered after full migration:

```bash
# 1. Restore Railway from backup
railway run psql $DATABASE_URL < latest-backup.sql

# 2. Update DNS back to Railway

# 3. Export Coolify database for analysis
pg_dump $COOLIFY_DATABASE_URL > coolify-debug.sql

# 4. Plan corrective actions
```

## 📊 Success Metrics

Migration is considered successful when:

- [ ] **Uptime**: Application accessible with <1 minute downtime
- [ ] **Performance**: Response times similar or better than Railway
- [ ] **Functionality**: All features working as before
- [ ] **Data Integrity**: No data loss or corruption
- [ ] **Stability**: No crashes or errors for 7 days
- [ ] **Cost**: Hosting costs within budget
- [ ] **Monitoring**: All alerts and monitoring active

## 🚨 Troubleshooting

### Common Issues

#### Issue: Database Connection Fails
```bash
# Check database URL format
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1;"

# Verify credentials
# Check Coolify database settings
```

#### Issue: Build Fails
```bash
# Check Node version in Coolify
# Should be 22.x

# Verify build command
# Should be: yarn install && yarn build

# Check build logs in Coolify dashboard
# Look for specific error messages
```

#### Issue: Health Check Failing
```bash
# Verify health check path
# Should be: /admin

# Check application logs
docker logs <container-name>

# Test endpoint manually
curl http://localhost:1337/admin
```

#### Issue: Slow Performance
```bash
# Check resource limits in Coolify
# Increase if needed

# Verify database indexes
# Run EXPLAIN ANALYZE on slow queries

# Enable Redis caching
# Add REDIS_URL environment variable
```

## 📞 Support Contacts

- **Coolify Community**: https://coolify.io/discord
- **Railway Support**: https://railway.app/help
- **Project Issues**: https://github.com/executiveusa/strapi-template-new-world-kids/issues
- **Emergency Contact**: support@newworldkids.org

## 📅 Migration Timeline Template

```
Day -7:  Migration planning and preparation
Day -3:  Database backup and verification
Day -1:  Reduce DNS TTL, final prep
Day 0:   Execute migration (Steps 1-10)
Day 1-7: Monitoring and verification
Day 7:   Railway cleanup (if stable)
Day 14:  Documentation update and closure
```

## ✅ Migration Complete

Once all checklist items are complete:

- [ ] Migration successful
- [ ] All verification passed
- [ ] Documentation updated
- [ ] Team notified
- [ ] Monitoring active
- [ ] Railway cleaned up
- [ ] Celebration! 🎉

**Migration Date**: _______________

**Performed By**: _______________

**Notes**: _______________

---

**Remember**: Keep Railway service running for at least 7 days after migration for easy rollback if needed. Do not rush the cleanup phase.
