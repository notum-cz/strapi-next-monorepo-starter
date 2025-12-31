# Deployment Guide

Complete guide for deploying the New World Kids Interactive Timeline to production.

## Deployment Options

1. **Vercel** (Recommended for Next.js)
2. **Netlify**
3. **Self-Hosted** (VPS, AWS, etc.)
4. **Embedded** (In existing Next.js app)

---

## Option 1: Vercel Deployment (Recommended)

### Prerequisites

- Vercel account ([vercel.com](https://vercel.com))
- Strapi instance running (local or hosted)
- CopilotKit API key

### Steps

#### 1. Install Vercel CLI

```bash
npm install -g vercel
```

#### 2. Login to Vercel

```bash
vercel login
```

#### 3. Deploy from project directory

```bash
cd apps/timeline-app
vercel
```

Follow the prompts:
- Link to existing project or create new? → Create new
- Project name: `new-world-kids-timeline`
- Directory: `.` (current directory)

#### 4. Configure Environment Variables

In Vercel dashboard:

```env
NEXT_PUBLIC_COPILOTKIT_PUBLIC_API_KEY=your_copilot_key
COPILOTKIT_RUNTIME_URL=/api/copilot
NEXT_PUBLIC_STRAPI_URL=https://your-strapi-instance.com
STRAPI_API_TOKEN=your_strapi_token
ENABLE_USER_UPLOADS=true
ENABLE_ADMIN_PANEL=true
REQUIRE_ADMIN_APPROVAL=true
MARKDOWN_TIMELINE_PATH=./public/data/timeline.md
```

#### 5. Deploy to Production

```bash
vercel --prod
```

#### 6. Custom Domain (Optional)

In Vercel dashboard:
- Settings → Domains
- Add: `timeline.newworldkids.org`
- Configure DNS as instructed

### Auto-Deploy from Git

1. Push code to GitHub
2. Import project in Vercel dashboard
3. Connect repository
4. Configure environment variables
5. Auto-deploy on push to `main` branch

---

## Option 2: Netlify Deployment

### Prerequisites

- Netlify account
- Strapi instance
- CopilotKit API key

### Steps

#### 1. Create `netlify.toml`

In `apps/timeline-app/netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### 2. Deploy via Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

#### 3. Configure Environment Variables

In Netlify dashboard → Site settings → Environment variables:

Add all variables from `.env.example`

---

## Option 3: Self-Hosted Deployment

### Using Docker

#### 1. Create `Dockerfile`

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

#### 2. Create `docker-compose.yml`

```yaml
version: '3.8'

services:
  timeline-app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_COPILOTKIT_PUBLIC_API_KEY=${COPILOTKIT_API_KEY}
      - NEXT_PUBLIC_STRAPI_URL=${STRAPI_URL}
      - STRAPI_API_TOKEN=${STRAPI_TOKEN}
    restart: unless-stopped
```

#### 3. Build and Run

```bash
docker-compose up -d
```

### Using PM2 (Traditional VPS)

#### 1. Install PM2

```bash
npm install -g pm2
```

#### 2. Build Application

```bash
npm run build
```

#### 3. Create PM2 Ecosystem File

`ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'nwkids-timeline',
    script: 'npm',
    args: 'start',
    cwd: '/path/to/timeline-app',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
  }],
};
```

#### 4. Start with PM2

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Nginx Reverse Proxy

`/etc/nginx/sites-available/timeline`:

```nginx
server {
    listen 80;
    server_name timeline.newworldkids.org;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/timeline /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Option 4: Embedded in Existing App

### For Main NWKids Monorepo

#### 1. Update Main App Package.json

In `apps/web/package.json`:

```json
{
  "dependencies": {
    "@nwkids/timeline-app": "workspace:*"
  }
}
```

#### 2. Create Timeline Page

`apps/web/src/app/[locale]/journey/page.tsx`:

```tsx
import dynamic from 'next/dynamic';

const TimelineApp = dynamic(
  () => import('@nwkids/timeline-app').then(mod => mod.TimelineApp),
  { ssr: false }
);

export default function JourneyPage() {
  return (
    <div className="min-h-screen">
      <TimelineApp />
    </div>
  );
}
```

#### 3. Export Timeline Component

In `apps/timeline-app/src/index.tsx`:

```tsx
'use client';

export { default as TimelineApp } from './app/page';
export { default as TimelineContainer } from './components/timeline/TimelineContainer';
```

#### 4. Shared Environment Variables

Ensure timeline env vars are available in main app's `.env.local`

---

## Strapi Deployment

### Strapi Cloud (Easiest)

1. Create account at [strapi.io](https://strapi.io/cloud)
2. Create new project
3. Deploy your content types
4. Get API URL and token

### Self-Hosted Strapi

#### Using Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Create project
railway init

# Deploy
railway up
```

#### Using Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create nwkids-strapi

# Deploy
git push heroku main
```

---

## Environment Variables Reference

### Required

```env
NEXT_PUBLIC_COPILOTKIT_PUBLIC_API_KEY=
NEXT_PUBLIC_STRAPI_URL=
STRAPI_API_TOKEN=
```

### Optional

```env
COPILOTKIT_RUNTIME_URL=/api/copilot
UPLOAD_MAX_FILE_SIZE=52428800
UPLOAD_MAX_FILES_PER_STAGE=50
ENABLE_USER_UPLOADS=true
ENABLE_ADMIN_PANEL=true
REQUIRE_ADMIN_APPROVAL=true
MARKDOWN_TIMELINE_PATH=./public/data/timeline.md
NEXT_PUBLIC_GA_ID=
SENTRY_DSN=
NEXT_PUBLIC_APP_URL=https://timeline.newworldkids.org
```

---

## Post-Deployment Checklist

- [ ] Verify all environment variables are set
- [ ] Test timeline loads with stages
- [ ] Test image uploads (if enabled)
- [ ] Test chat functionality
- [ ] Test on mobile devices
- [ ] Run Lighthouse performance audit
- [ ] Set up monitoring (Sentry, LogRocket, etc.)
- [ ] Configure analytics (Google Analytics, Plausible, etc.)
- [ ] Set up error tracking
- [ ] Create backups of Strapi database
- [ ] Test share links
- [ ] Verify accessibility (WCAG 2.1 AA)
- [ ] Test with screen reader
- [ ] Check HTTPS/SSL certificate
- [ ] Configure CDN for media (if needed)

---

## Performance Optimization

### Image Optimization

Use Next.js Image component (already implemented):

```tsx
<Image
  src={url}
  alt={alt}
  width={800}
  height={600}
  sizes="(max-width: 768px) 100vw, 50vw"
  priority={false}
/>
```

### Caching Strategy

API routes include cache headers:

```typescript
return NextResponse.json(data, {
  headers: {
    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
  },
});
```

### CDN Configuration

For Vercel:
- Images automatically optimized via Vercel Image Optimization
- Static assets served via Vercel Edge Network

For custom deployment:
- Use CloudFlare, AWS CloudFront, or similar
- Cache `/public/*` and `/_next/static/*`

---

## Monitoring & Analytics

### Recommended Tools

1. **Vercel Analytics** (if using Vercel)
2. **Sentry** for error tracking
3. **LogRocket** for session replay
4. **Plausible** or Google Analytics for visitor analytics

### Setup Sentry

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

### Setup Google Analytics

In `app/layout.tsx`:

```tsx
import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}
```

---

## Troubleshooting

### Build Fails

**Error:** Module not found

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Images Not Loading

**Error:** 403 Forbidden on images

**Solution:**
1. Check CORS in Strapi (`config/middlewares.js`)
2. Verify `NEXT_PUBLIC_STRAPI_URL` is correct
3. Check Strapi media permissions

### Slow Performance

**Solutions:**
1. Enable image optimization
2. Implement lazy loading
3. Use CDN for static assets
4. Enable compression (gzip/brotli)
5. Optimize bundle size with `next/bundle-analyzer`

### Chat Not Working

**Error:** CopilotKit errors

**Solution:**
1. Verify `NEXT_PUBLIC_COPILOTKIT_PUBLIC_API_KEY`
2. Check API rate limits
3. Ensure `/api/copilot` route is accessible
4. Check browser console for errors

---

## Security Best Practices

1. **Environment Variables**: Never commit `.env.local`
2. **API Tokens**: Rotate regularly
3. **HTTPS**: Always use HTTPS in production
4. **CORS**: Restrict to specific domains
5. **CSP**: Implement Content Security Policy
6. **Rate Limiting**: Protect API endpoints
7. **Input Validation**: Validate all user inputs
8. **File Uploads**: Scan for malware, validate types
9. **Auth**: Implement proper authentication for admin features

---

## Backup Strategy

### Strapi Database Backup

```bash
# PostgreSQL
pg_dump -U user -d strapi > backup-$(date +%Y%m%d).sql

# MongoDB
mongodump --db strapi --out backup-$(date +%Y%m%d)
```

### Media Files Backup

```bash
# Copy uploads directory
tar -czf uploads-$(date +%Y%m%d).tar.gz /path/to/uploads
```

### Automated Backups

Set up cron job:

```bash
0 2 * * * /path/to/backup-script.sh
```

---

## Support

For deployment issues:
- Email: dev@newworldkids.org
- GitHub: [Create an issue](https://github.com/newworldkids/timeline/issues)
- Documentation: [Full docs](https://docs.newworldkids.org)
