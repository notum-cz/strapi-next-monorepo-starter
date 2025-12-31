# Railway Deployment Guide

## Current Status
✅ **Frontend overhaul complete** - All changes pushed to branch `claude/overhaul-frontend-ui-01RwkoRK9VFAntoGASV3iYcJ`

## Viewing Your Changes

### Option 1: Merge PR and Auto-Deploy (Recommended)
1. Go to: https://github.com/executiveusa/strapi-template-new-world-kids/pull/new/claude/overhaul-frontend-ui-01RwkoRK9VFAntoGASV3iYcJ
2. Review the changes
3. Click "Create Pull Request"
4. Once approved, merge to `main`
5. Railway will automatically deploy if connected to the repo

### Option 2: Deploy via Railway CLI

#### Install Railway CLI
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link to your project
railway link

# Deploy from current branch
railway up
```

#### Deploy Specific Service
```bash
# Deploy web app only
railway up --service web

# Deploy backend only
railway up --service backend
```

### Option 3: Deploy via Railway Dashboard

1. **Go to Railway Dashboard**: https://railway.app/dashboard
2. **Create New Project** or select existing project
3. **Connect GitHub Repository**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose `executiveusa/strapi-template-new-world-kids`
   - Select branch: `claude/overhaul-frontend-ui-01RwkoRK9VFAntoGASV3iYcJ` or `main` (after merge)

4. **Configure Services**:

   **Web App (Next.js)**:
   - Root Directory: `apps/web`
   - Build Command: `yarn install && yarn build`
   - Start Command: `yarn start`
   - Port: `3000`

   **Backend (Strapi)**:
   - Root Directory: `apps/strapi`
   - Build Command: `yarn install && yarn build`
   - Start Command: `yarn start`
   - Port: `1337`

5. **Environment Variables**:

   **Web App Variables:**
   ```env
   NODE_ENV=production
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   STRAPI_REST_READONLY_API_KEY=your_strapi_key
   NEXT_PUBLIC_STRAPI_REST_URL=https://your-backend.railway.app
   ```

   **Backend Variables:**
   ```env
   NODE_ENV=production
   DATABASE_URL=your_database_url
   ADMIN_JWT_SECRET=your_admin_jwt_secret
   API_TOKEN_SALT=your_api_token_salt
   APP_KEYS=your_app_keys
   JWT_SECRET=your_jwt_secret
   TRANSFER_TOKEN_SALT=your_transfer_token_salt
   ```

6. **Deploy**: Click "Deploy" button

## What's Deployed

### New API Endpoints
- `/api/impact/metrics` - Real-time nonprofit impact data
- `/api/activity/feed` - Activity stream for observability dashboard
- `/api/agents/stats` - Agent performance statistics

### New Pages
- `/cockpit` - Enhanced main dashboard with live stats
- `/cockpit/agents/[name]` - Individual agent detail pages with chat interface
- `/cockpit/observability` - Complete activity monitoring dashboard

### New Features
- Real-time data updates (5-10 second intervals)
- Animated skeleton loading states
- Game-style toast notifications
- Voice input/output for agent interactions
- Task history tracking
- Performance charts and metrics

## Accessing Your Deployed Site

Once deployed, Railway will provide URLs like:
- **Web App**: `https://your-web-app.up.railway.app`
- **Backend**: `https://your-backend.up.railway.app`

### Test the New Features

1. **Main Dashboard**: Visit `/cockpit`
   - See 6 AI agents with real-time stats
   - Click any agent to interact
   - View impact metrics

2. **Agent Interaction**: Visit `/cockpit/agents/sirius` (or any agent)
   - Chat with the agent
   - Use voice input (click microphone icon)
   - View task history and performance stats

3. **Observability**: Visit `/cockpit/observability`
   - Real-time activity feed
   - Filter by agent or log level
   - System health monitoring

## Troubleshooting

### Build Failures
- **Issue**: Build fails with module not found
- **Solution**: Ensure all dependencies in `package.json` are correct
- **Command**: `railway logs` to see build errors

### Runtime Errors
- **Issue**: App crashes on startup
- **Solution**: Check environment variables are set
- **Command**: `railway logs --tail` for real-time logs

### Database Connection
- **Issue**: Supabase connection fails
- **Solution**: Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Test**: Visit `/api/agents/stats` to check API response

## Current Branch
All changes are on: `claude/overhaul-frontend-ui-01RwkoRK9VFAntoGASV3iYcJ`

## Files Changed
- 10 files modified
- 2,463 lines added
- 390 lines removed

## Next Steps
1. Merge the PR on GitHub (conflicts are resolved)
2. Deploy via Railway dashboard or CLI
3. Configure environment variables
4. Test the new features
5. Set up custom domain (optional)

## Support
- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Project Issues: https://github.com/executiveusa/strapi-template-new-world-kids/issues
