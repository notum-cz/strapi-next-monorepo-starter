# Deployment Architecture Overview

## 🏗️ Zero-Secrets Deployment System

This repository implements a **comprehensive, repo-agnostic zero-secrets deployment architecture** based on the Railway Zero-Secrets Bootstrapper meta-prompt. The system ensures secure, cost-effective, and maintainable deployments across multiple hosting platforms.

## 📁 Architecture Files

### Secret Management

| File | Purpose | Committed to Git |
|------|---------|------------------|
| **`.agents`** | Machine-readable secret specification schema | ✅ Yes |
| **`master.secrets.json`** | Local secret storage template | ❌ No (gitignored) |
| **`.env.example`** | Environment variable documentation | ✅ Yes |

### Railway Deployment

| File | Purpose | Committed to Git |
|------|---------|------------------|
| **`railway.toml`** | Primary Railway configuration with cost guardrails | ✅ Yes |
| **`railway.json`** | Alternative JSON configuration format | ✅ Yes |
| **`RAILWAY_ZERO_SECRETS_DEPLOYMENT.md`** | Complete Railway deployment guide | ✅ Yes |

### Coolify/Alternative Hosting

| File | Purpose | Committed to Git |
|------|---------|------------------|
| **`COOLIFY_SUPPORT.md`** | Coolify deployment instructions + Hostinger VPN | ✅ Yes |
| **`COOLIFY_MIGRATION.md`** | Step-by-step migration checklist | ✅ Yes |

### Maintenance & Failover

| File | Purpose | Committed to Git |
|------|---------|------------------|
| **`maintenance.html`** | Static maintenance page for free-tier breach | ✅ Yes |

## 🔐 Secret Management Architecture

### Three-Layer Secret System

```
┌─────────────────────────────────────────────────────────┐
│                    Layer 1: Documentation                │
│  .agents (public) - Schema for all required secrets     │
│  .env.example - Documentation with placeholder values   │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│               Layer 2: Local Development                 │
│  master.secrets.json (gitignored) - Real secrets        │
│  .env.local (gitignored) - Working environment          │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│              Layer 3: Production Deployment              │
│  Railway Variables UI - Injected at runtime             │
│  Coolify Environment Variables - Injected at runtime    │
└─────────────────────────────────────────────────────────┘
```

### The `.agents` File Schema

```json
{
  "project": "project-name",
  "core": { 
    "secrets": [...] // Required for basic operation
  },
  "required_secrets": {
    "secrets": [...] // Must be generated/set for production
  },
  "optional": {
    "integrations": [...] // Third-party services (can be stubbed)
  },
  "schema": {
    "consumer": "secrets-provisioning-agent"
  }
}
```

**Purpose**: Machine-readable specification consumed by:
- Deployment automation tools
- Secret provisioning agents
- Documentation generators
- Security auditors

## 💰 Cost Protection Architecture

### Free-Tier Guardrails

```
┌──────────────────────────────────────────────────────┐
│            Normal Operation (0-80% usage)            │
│  • Full application running                          │
│  • All features enabled                              │
│  • Auto-sleep after 15min inactivity                 │
└──────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────┐
│          Warning Zone (80-100% usage)                │
│  • Logs warning messages                             │
│  • Email notifications sent                          │
│  • Consider optimization or upgrade                  │
└──────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────┐
│       Maintenance Mode (100%+ usage reached)         │
│  • Main application suspended                        │
│  • maintenance.html deployed                         │
│  • No further costs incurred                         │
│  • Migration to Coolify recommended                  │
└──────────────────────────────────────────────────────┘
```

### Resource Limits

Enforced in `railway.toml`:

```toml
[deploy.resources]
memoryLimit = "512Mi"    # Hard cap at 512MB RAM
cpuLimit = "500m"        # Hard cap at 0.5 CPU cores

[deploy.optimization]
sleepAfterInactivity = "15m"  # Auto-sleep timer
instanceSize = "starter"      # Smallest instance type

[monitoring]
monthlyBudgetUsd = 5.0            # Free tier limit
alertThresholdPercent = 80        # Alert at 80%
onBudgetExceeded = "MAINTENANCE_MODE"
```

## 🔄 Multi-Platform Deployment Flow

### Primary Path: Railway

```
1. Developer pushes code
       ↓
2. Railway detects push
       ↓
3. Build with cost constraints
   • 512MB RAM limit
   • 0.5 CPU limit
   • Auto-sleep enabled
       ↓
4. Deploy with monitoring
   • Track free-tier usage
   • Alert at 80%
   • Maintenance mode at 100%
       ↓
5. Production accessible
   • https://app.up.railway.app
   • Health checks active
   • Cost protection enforced
```

### Fallback Path: Coolify

```
1. Free-tier exceeded OR manual trigger
       ↓
2. Export database from Railway
       ↓
3. Deploy to Coolify VPS
   • Self-hosted infrastructure
   • Fixed monthly cost
   • Unlimited usage
       ↓
4. Import database
       ↓
5. Update DNS
       ↓
6. Production on Coolify
   • https://app.yourdomain.com
   • Optional: Hostinger VPN
   • Full control
```

## 🌐 Hostinger VPN Integration

### Architecture

```
Internet Users
      ↓
[Public Domain]
      ↓
[Coolify Server] ←──┐
      ↓              │
[Application]        │
      ↓              │
[Hostinger VPN]──────┘
      ↓
[Private Services]
  • PostgreSQL (10.8.0.10)
  • Redis (10.8.0.11)
  • Other backends
```

### Benefits

- **Security**: Services not exposed to public internet
- **Performance**: Direct VPN routing, lower latency
- **Flexibility**: Easy service addition without port exposure
- **Cost**: No need for managed private networking services

### Setup

See `COOLIFY_SUPPORT.md` for complete Hostinger VPN configuration.

## 📊 Deployment Decision Matrix

| Scenario | Recommended Platform | Reason |
|----------|---------------------|---------|
| **Initial Development** | Railway Free Tier | Zero-config, instant deploy |
| **Small Project (<500 exec hours/month)** | Railway Free Tier | Sufficient for low-traffic apps |
| **Medium Project** | Railway Hobby Plan ($5/mo) | More resources, still managed |
| **Production (high traffic)** | Coolify on VPS | Fixed cost, unlimited usage |
| **Enterprise** | Coolify + VPN | Full control, private networking |
| **Multi-Region** | Railway Pro | Global edge deployment |

## 🔧 Configuration Precedence

Railway uses the following precedence (highest to lowest):

1. **Environment Variables** (Railway Dashboard/CLI)
2. **`railway.toml`** (Root level)
3. **`railway.json`** (Root level)
4. **`services/*/railway.toml`** (Service-specific)
5. **Auto-detection** (Nixpacks/Buildpacks)

## 🚀 Deployment Workflows

### Standard Deploy

```bash
# Local → Railway
git push origin main
# Railway auto-deploys

# Or manual:
railway up
```

### Emergency Maintenance Mode

```bash
# Activate manually
railway service create maintenance
railway up --service maintenance --path ./maintenance.html
railway service suspend main
```

### Migration to Coolify

```bash
# Follow COOLIFY_MIGRATION.md checklist
# High-level steps:
1. railway run pg_dump $DATABASE_URL > backup.sql
2. Deploy to Coolify
3. Import database
4. Update DNS
5. Cleanup Railway
```

## 📈 Monitoring & Observability

### Built-in Monitoring

- **Railway Dashboard**: Resource usage graphs
- **Cost Tracking**: Real-time spend tracking
- **Logs**: Streaming application logs
- **Alerts**: Email notifications at thresholds

### Health Checks

```
Endpoint: /admin
Interval: 30s
Timeout: 10s
Start Period: 40s
```

### Usage Queries

```bash
# Check current usage
railway status

# View logs
railway logs

# Get metrics
railway metrics
```

## 🔐 Security Considerations

### Secret Handling

✅ **DO:**
- Store secrets in Railway Variables UI
- Keep `master.secrets.json` gitignored
- Rotate secrets regularly
- Use environment-specific secrets

❌ **DON'T:**
- Commit secrets to Git
- Share secrets via email/chat
- Hardcode API keys
- Reuse secrets across environments

### Network Security

- **Railway**: HTTPS enforced, managed certificates
- **Coolify**: Let's Encrypt auto-renewal
- **VPN**: OpenVPN for private networking
- **Firewall**: UFW with restrictive rules

## 📚 Documentation Index

| Document | Purpose | Audience |
|----------|---------|----------|
| **RAILWAY_ZERO_SECRETS_DEPLOYMENT.md** | Complete Railway guide | Developers deploying to Railway |
| **COOLIFY_SUPPORT.md** | Coolify setup & VPN config | DevOps, advanced users |
| **COOLIFY_MIGRATION.md** | Migration checklist | Teams migrating platforms |
| **DEPLOYMENT_ARCHITECTURE.md** | This file - system overview | Architects, project leads |
| **`.agents`** | Secret specification | Automation tools, auditors |
| **README.md** | Project overview | All users |

## 🎯 Design Principles

This architecture follows these core principles:

1. **Zero Secrets in Git**: No credentials ever committed
2. **Fail-Safe**: Automatic maintenance mode prevents runaway costs
3. **Multi-Platform**: Easy migration between hosting providers
4. **Cost-Conscious**: Free-tier optimized by default
5. **Self-Documenting**: Machine-readable specifications
6. **Security First**: Defense in depth, principle of least privilege
7. **Developer Friendly**: Clear documentation, simple workflows
8. **Production Ready**: Designed for real-world use

## 🔄 Future Enhancements

Planned improvements:

- [ ] Automated secret rotation scripts
- [ ] Multi-region deployment templates
- [ ] Cost optimization recommendations
- [ ] Performance benchmarking tools
- [ ] Automated backup strategies
- [ ] CI/CD integration examples
- [ ] Kubernetes deployment option
- [ ] Terraform/IaC configurations

## 📞 Support & Contributing

- **Issues**: https://github.com/executiveusa/strapi-template-new-world-kids/issues
- **Discussions**: https://github.com/executiveusa/strapi-template-new-world-kids/discussions
- **Email**: support@newworldkids.org

## 📄 License

This deployment architecture is part of the New World Kids platform and follows the same license as the main project (MIT).

---

**Last Updated**: 2025-12-06

**Architecture Version**: 1.0.0

**Status**: ✅ Production Ready
