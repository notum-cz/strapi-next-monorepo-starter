# Quick Start Guide

Get the New World Kids Interactive Timeline running in 15 minutes.

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- Basic familiarity with Next.js

## Step 1: Install Dependencies (2 min)

```bash
cd apps/timeline-app
npm install
```

## Step 2: Set Up Environment (3 min)

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

```env
# CopilotKit (Get key from copilotkit.ai)
NEXT_PUBLIC_COPILOTKIT_PUBLIC_API_KEY=your_key_here

# Strapi (Use local or hosted instance)
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=your_token_here

# Features
ENABLE_USER_UPLOADS=true
ENABLE_ADMIN_PANEL=true
```

## Step 3: Set Up Strapi (5 min)

### Option A: Use Existing Strapi

If you already have Strapi running, create the content types from [docs/STRAPI_SCHEMA.md](docs/STRAPI_SCHEMA.md).

### Option B: Quick Strapi Setup

```bash
# In a new terminal
npx create-strapi-app@latest strapi-timeline --quickstart

# Follow the prompts to create an admin user
```

Once Strapi is running:

1. Go to http://localhost:1337/admin
2. Create content types (use [docs/STRAPI_SCHEMA.md](docs/STRAPI_SCHEMA.md))
3. Add sample data for at least one stage
4. Get API token from Settings → API Tokens

## Step 4: Add Timeline Data (2 min)

The sample timeline markdown is already in `public/data/timeline.md`. You can edit it or use as-is for testing.

## Step 5: Run Development Server (1 min)

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001)

## Step 6: Test Features (2 min)

1. ✅ **Timeline loads** - You should see stage cards
2. ✅ **Click a card** - Modal opens with tabs
3. ✅ **Browse gallery** - Click photos to open lightbox
4. ✅ **Test chat** - Ask a question in the Chat tab
5. ✅ **Check metrics** - View visualized data

## Common Issues

### Issue: "Failed to fetch timeline"

**Solution:** Check that:
- Strapi is running on the URL in `.env.local`
- API token is correct
- Content types exist in Strapi
- At least one stage has been created

### Issue: CopilotKit errors

**Solution:**
- Verify `NEXT_PUBLIC_COPILOTKIT_PUBLIC_API_KEY` is set
- Check you haven't exceeded API rate limits
- Ensure key is valid at [copilotkit.ai](https://copilotkit.ai)

### Issue: Images not loading

**Solution:**
- Check CORS settings in Strapi
- Verify image URLs are accessible
- Check browser console for errors

## Next Steps

### Add Real Data

1. **Create Stages** in Strapi Content Manager
   - Add title, description, dates, status
   - Upload featured image
   - Add to gallery

2. **Add People**
   - Create person entries
   - Link to stages

3. **Add Metrics**
   - Create metric entries
   - Choose visualization type

4. **Upload Documents**
   - Add budgets, plans, videos
   - Set visibility

### Customize Branding

Edit colors in `tailwind.config.ts`:

```typescript
colors: {
  'nwk-green': '#16a34a',   // Your primary color
  'nwk-brown': '#8B6F47',   // Your secondary color
  // ...
}
```

### Deploy to Production

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for full deployment guide.

Quick deploy to Vercel:

```bash
npm install -g vercel
vercel
```

## Development Tips

### Hot Reload

The dev server supports hot reload. Edit any file and see changes instantly.

### Component Development

Components are in `src/components/`:
- `timeline/` - Main timeline components
- `modals/` - Modal dialogs
- `panels/` - Tab panels for stage details

### API Routes

API routes are in `src/app/api/`:
- `timeline/` - Data fetching
- `upload/` - File uploads
- `copilot/` - CopilotKit runtime

### Debugging

1. Check browser console for errors
2. Check terminal for server errors
3. Use React DevTools
4. Enable Strapi debug mode

## Support

- 📖 [Full Documentation](README.md)
- 🚀 [Deployment Guide](docs/DEPLOYMENT.md)
- 🗄️ [Strapi Schema](docs/STRAPI_SCHEMA.md)
- 💬 [GitHub Issues](https://github.com/newworldkids/timeline/issues)

---

**Time to first render:** ~15 minutes
**Built with:** Next.js + CopilotKit + Strapi
