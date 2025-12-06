# Coolify Deployment Support

This document provides comprehensive instructions for deploying the New World Kids platform on Coolify, including Hostinger VPN integration for private networking.

## 🎯 Overview

Coolify is an open-source, self-hostable Heroku/Netlify alternative that can serve as a fallback deployment option when:
- Railway free-tier limits are reached
- You need more control over hosting infrastructure
- You want to deploy on your own VPS (e.g., Hostinger)
- You require private networking via VPN tunnels

## 📋 Prerequisites

### Required
- Coolify instance (v4.0+) installed on a VPS
- Docker and Docker Compose installed
- PostgreSQL database (can be external or Coolify-managed)
- Domain name or subdomain configured
- SSH access to your server

### Optional
- Hostinger VPN account and configuration
- Redis instance for caching
- S3-compatible object storage

## 🚀 Deployment Methods

### Method 1: Direct Git Integration (Recommended)

1. **Connect Repository to Coolify**
   ```bash
   # In Coolify dashboard:
   # 1. Go to "Applications"
   # 2. Click "New Application"
   # 3. Select "Git Repository"
   # 4. Enter: https://github.com/executiveusa/strapi-template-new-world-kids.git
   # 5. Select branch: main
   ```

2. **Configure Build Settings**
   - Build Pack: `nixpacks` or `dockerfile`
   - Base Directory: `/`
   - Build Command: `yarn install && yarn build`
   - Start Command: `yarn start`
   - Port: `1337`

3. **Set Environment Variables**
   
   See `.agents` file for complete list. Minimum required:
   
   ```bash
   NODE_ENV=production
   PORT=1337
   DATABASE_URL=postgresql://user:pass@host:5432/dbname
   STRAPI_ADMIN_JWT=<generate-with-crypto>
   ```

4. **Deploy**
   - Click "Deploy" in Coolify dashboard
   - Monitor build logs
   - Access via assigned subdomain

### Method 2: Docker Compose Deployment

1. **Create Coolify Resource**
   ```bash
   # In Coolify:
   # 1. New Resource → Docker Compose
   # 2. Name: newworldkids-platform
   ```

2. **Use Provided Docker Compose**
   
   Coolify will use the `docker-compose.yml` from the repository:
   ```yaml
   # Environment variables will be injected by Coolify
   # No manual configuration needed
   ```

3. **Configure Volumes**
   - Database data: `/var/lib/postgresql/data`
   - Application uploads: `/app/public/uploads`
   - Logs: `/app/logs`

### Method 3: Manual Server Setup

1. **Clone Repository**
   ```bash
   ssh user@your-server
   cd /opt
   git clone https://github.com/executiveusa/strapi-template-new-world-kids.git
   cd strapi-template-new-world-kids
   ```

2. **Install Dependencies**
   ```bash
   nvm install 22
   nvm use 22
   yarn install
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your production values
   # Use master.secrets.json as reference
   ```

4. **Build and Start**
   ```bash
   yarn build
   yarn start
   ```

5. **Setup Process Manager**
   ```bash
   # Using PM2
   npm install -g pm2
   pm2 start yarn --name "newworldkids" -- start
   pm2 save
   pm2 startup
   ```

## 🔐 Hostinger VPN Integration

### Why Use Hostinger VPN?

- Secure private networking between services
- Bypass public internet for internal communication
- Enhanced security and reduced attack surface
- Better performance for service-to-service calls

### Setup Steps

1. **Install Hostinger VPN Client**
   ```bash
   # On your Coolify server
   sudo apt update
   sudo apt install openvpn
   
   # Download Hostinger VPN config
   # Get from: Hostinger Control Panel → VPN → Download Config
   wget https://vpn.hostinger.com/config/yourconfig.ovpn
   ```

2. **Configure VPN Connection**
   ```bash
   # Copy config to OpenVPN directory
   sudo cp yourconfig.ovpn /etc/openvpn/client/
   
   # Start VPN service
   sudo systemctl start openvpn-client@yourconfig
   sudo systemctl enable openvpn-client@yourconfig
   
   # Verify connection
   ip addr show tun0
   ```

3. **Update Service Networking**
   
   In your Coolify environment variables:
   ```bash
   # Use VPN internal IPs instead of public IPs
   DATABASE_HOST=10.8.0.x  # VPN IP of database server
   REDIS_URL=redis://10.8.0.y:6379
   ```

4. **Configure Firewall Rules**
   ```bash
   # Allow VPN traffic
   sudo ufw allow from 10.8.0.0/24
   
   # Allow only necessary public ports
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw allow 22/tcp
   
   # Block direct database access from public internet
   sudo ufw deny 5432/tcp
   ```

### VPN Network Diagram

```
Internet
   |
   └─> [Cloudflare/Proxy]
          |
          └─> [Coolify Server]
                 |
                 ├─> Public Port 80/443 (HTTPS)
                 |
                 └─> [Hostinger VPN] (10.8.0.x)
                        |
                        ├─> PostgreSQL (10.8.0.10:5432)
                        ├─> Redis (10.8.0.11:6379)
                        └─> Other Services
```

## 🔧 Environment Variables for Coolify

### Core Variables (Required)

```bash
# Application
NODE_ENV=production
PORT=1337

# Database
DATABASE_URL=postgresql://user:pass@host:5432/newworldkids
DATABASE_SSL=true

# Strapi Secrets
STRAPI_ADMIN_JWT=<generate-with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
STRAPI_TOKEN=<generate-in-admin-panel>

# Public URLs
APP_PUBLIC_URL=https://newworldkids.yourdomain.com
NEXT_PUBLIC_STRAPI_URL=https://api.newworldkids.yourdomain.com
```

### Optional Integrations

Enable only what you need - see `master.secrets.json` for full list.

```bash
# Supabase (Optional)
NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-key>

# Redis (Optional - recommended for performance)
REDIS_URL=redis://localhost:6379

# Monitoring (Optional)
SENTRY_DSN=<your-sentry-dsn>
```

## 📊 Resource Requirements

### Minimum Specifications
- **CPU**: 1 vCPU (2 vCPU recommended)
- **RAM**: 1 GB (2 GB recommended)
- **Storage**: 10 GB SSD (20 GB recommended)
- **Bandwidth**: Unmetered or 1 TB/month

### Recommended VPS Providers
- **Hostinger VPS**: $4.99/month (Premium plan)
- **DigitalOcean**: $6/month (Basic Droplet)
- **Hetzner Cloud**: €4.15/month (CPX11)
- **Linode**: $5/month (Nanode)
- **Vultr**: $6/month (Regular Performance)

## 🔄 Migration from Railway

See detailed migration guide in `COOLIFY_MIGRATION.md`.

Quick checklist:
- [ ] Export Railway database
- [ ] Set up PostgreSQL on Coolify
- [ ] Import database backup
- [ ] Configure environment variables
- [ ] Deploy application
- [ ] Update DNS records
- [ ] Test thoroughly
- [ ] Shutdown Railway service

## 🏥 Health Checks

Configure in Coolify:

```yaml
healthcheck:
  path: /admin
  port: 1337
  interval: 30s
  timeout: 10s
  retries: 3
  startPeriod: 40s
```

## 🔒 SSL/TLS Configuration

Coolify handles SSL automatically via Let's Encrypt:

1. Add domain in Coolify dashboard
2. Enable "Force HTTPS"
3. Certificate auto-renews every 60 days

For Hostinger domains:
1. Point A record to VPS IP
2. Wait for DNS propagation (up to 48h)
3. Coolify will provision certificate

## 📈 Scaling and Performance

### Horizontal Scaling
```bash
# In Coolify, increase replicas:
# Application Settings → Replicas → Set to 2+
# Requires load balancer configuration
```

### Vertical Scaling
- Upgrade VPS plan in hosting provider
- Adjust resource limits in Coolify
- No application changes needed

### Caching Layer
```bash
# Add Redis for performance
# In Coolify: Add Resource → Redis
# Update REDIS_URL in environment variables
```

## 🐛 Troubleshooting

### Build Fails

```bash
# Check Node version
node --version  # Should be 22.x

# Clear cache
rm -rf node_modules .turbo
yarn install
```

### Database Connection Issues

```bash
# Test connection
psql $DATABASE_URL

# Check VPN status
sudo systemctl status openvpn-client@yourconfig

# Verify firewall rules
sudo ufw status
```

### Application Won't Start

```bash
# Check logs in Coolify dashboard
# Or SSH to server:
docker logs -f <container-name>

# Verify environment variables
docker exec <container-name> env | grep DATABASE_URL
```

### VPN Connection Problems

```bash
# Restart VPN service
sudo systemctl restart openvpn-client@yourconfig

# Check VPN logs
sudo journalctl -u openvpn-client@yourconfig -f

# Test VPN connectivity
ping 10.8.0.1
```

## 📞 Support

- **Coolify Documentation**: https://coolify.io/docs
- **Hostinger Support**: https://www.hostinger.com/tutorials/vps
- **Project Issues**: https://github.com/executiveusa/strapi-template-new-world-kids/issues
- **Email**: support@newworldkids.org

## 🎯 Next Steps

1. Review `COOLIFY_MIGRATION.md` for detailed migration process
2. Check `.agents` file for complete secret requirements
3. Prepare `master.secrets.json` with your values
4. Test deployment on staging environment first
5. Plan maintenance window for production migration

---

**Note**: This is a compatibility document. Coolify deployment is not active by default. Use Railway for initial zero-secrets deployment, then migrate to Coolify when needed.
