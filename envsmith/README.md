# EnvSmith

**Secure web app for generating `.env` files and syncing secrets to GitHub and Vercel.**

EnvSmith is a minimal, secure tool that helps developers manage environment variables through a chat-like interface. It generates validated `.env` files from templates and can sync secrets to GitHub Actions and Vercel projects without storing any sensitive data.

## Features

- 🤖 **Chat-to-Env Generation**: Natural language to structured environment variables
- 📋 **Template Library**: Pre-built templates for Next.js, Supabase, Stripe, OpenAI, AWS, and more
- ✅ **Validation**: Pattern-based validation for API keys and URLs
- 🔐 **GitHub Secrets**: Sync to GitHub Actions repository and environment secrets (encrypted with libsodium)
- ⚡ **Vercel Integration**: Upsert environment variables to Vercel projects
- 🔒 **Security-First**: No persistent storage, in-memory processing only, CSP headers
- 📦 **Export Options**: Download as file or copy to clipboard

## Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### Docker

```bash
# Build image
docker build -t envsmith .

# Run container
docker run -p 3000:3000 envsmith
```

### Environment Variables

Create a `.env.local` file for local development:

```bash
# Optional: Default values for smoke test
VERCEL_TEAM_SLUG=your-team-slug
VERCEL_PROJECT_NAME=your-project-name
```

## Usage

### 1. Generate Environment Variables

1. **Describe your project** (optional): Enter natural language like "Next.js app with Supabase and Stripe"
2. **Select templates**: Click template buttons or use the parser to auto-detect
3. **Generate**: Click "Generate .env" to create your environment file

### 2. Edit Variables

- Edit values directly in the table
- Add custom variables
- Delete unwanted entries
- Preview updates in real-time

### 3. Export or Sync

#### Download

- **Download .env**: Get the file for local use
- **Copy to Clipboard**: Quick copy for pasting

#### GitHub Secrets Sync

1. **Generate a Personal Access Token** (PAT) at [github.com/settings/tokens](https://github.com/settings/tokens)
   - Required scope: `repo` (or `actions` for environment secrets)
2. **Enter credentials**:
   - Token (PAT)
   - Owner (username or org)
   - Repository name
   - Environment name (optional, for environment-specific secrets)
3. **Click "Sync to GitHub"**

Secrets are encrypted using **libsodium sealed boxes** before being sent to GitHub.

#### Vercel Integration

1. **Get Vercel Token** at [vercel.com/account/tokens](https://vercel.com/account/tokens)
   - Scope: Read and Write for Projects
2. **Enter credentials**:
   - Vercel Token
   - Project Name (e.g., `my-nextjs-app`)
   - Team Slug (e.g., `my-team`)
3. **Select target environments**: `development`, `preview`, `production`
4. **Click "Sync to Vercel"**

Variables are created/updated using the Vercel API `/v10/projects/{project}/env?upsert=true` endpoint.

#### Smoke Test

Click **"Smoke Test"** to verify your Vercel integration by creating a test variable:

```
ENVSMITH_SMOKE_TEST=ok
```

This tests the connection to your Vercel project without syncing all variables.

**First-run defaults:**
- Project: `strapi-template-new-world-kids`
- Team: `jeremy-bowers-s-projects`
- Target: `development`

## Templates

EnvSmith includes the following built-in templates:

| Template | Description | Key Variables |
|----------|-------------|---------------|
| **Next.js** | Next.js application | `NEXT_PUBLIC_APP_URL`, `DATABASE_URL`, `NEXTAUTH_SECRET` |
| **Node + Express** | Express.js backend | `PORT`, `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN` |
| **Supabase** | Supabase integration | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| **PostgreSQL** | PostgreSQL database | `DATABASE_URL`, `POSTGRES_HOST`, `POSTGRES_PORT` |
| **Stripe** | Stripe payments | `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY` |
| **OpenAI** | OpenAI API | `OPENAI_API_KEY`, `OPENAI_ORG_ID` |
| **Anthropic** | Anthropic Claude | `ANTHROPIC_API_KEY` |
| **Google Cloud** | GCP services | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| **AWS** | Amazon Web Services | `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` |
| **Django** | Django web framework | `DJANGO_SECRET_KEY`, `DATABASE_URL`, `ALLOWED_HOSTS` |
| **Ruby on Rails** | Rails application | `RAILS_ENV`, `SECRET_KEY_BASE`, `DATABASE_URL` |

## API Endpoints

### Generate .env

```bash
POST /api/generate-env
Content-Type: application/json

{
  "stack": ["nextjs", "supabase"],
  "overrides": {
    "DATABASE_URL": "postgresql://..."
  },
  "includeComments": true,
  "includeDefaults": false
}
```

### GitHub Connect

```bash
POST /api/github/connect
Content-Type: application/json

{
  "tokenType": "pat",
  "token": "ghp_..."
}
```

### GitHub Sync Secrets

```bash
POST /api/github/secrets/sync
Content-Type: application/json

{
  "owner": "username",
  "repo": "repo-name",
  "environment": "production",
  "secrets": {
    "API_KEY": "value"
  },
  "token": "ghp_..."
}
```

### Vercel Sync

```bash
POST /api/vercel/env/sync
Content-Type: application/json

{
  "projectName": "my-project",
  "teamSlug": "my-team",
  "items": [
    {
      "key": "API_KEY",
      "value": "secret",
      "target": ["development", "production"]
    }
  ],
  "token": "vercel_token"
}
```

### Vercel Smoke Test

```bash
POST /api/vercel/env/smoke
Content-Type: application/json

{
  "projectName": "strapi-template-new-world-kids",
  "teamSlug": "jeremy-bowers-s-projects",
  "token": "vercel_token",
  "target": "development"
}
```

## Security

### No Persistent Storage

- All secret processing happens **in-memory only**
- No database, no file system writes
- Secrets are cleared after each request

### Encrypted Transmission

- **GitHub**: Secrets encrypted using libsodium sealed boxes before API calls
- **Vercel**: Variables use `encrypted` type by default
- All API calls over HTTPS only

### Security Headers

- **CSP**: Content Security Policy with strict defaults
- **X-Frame-Options**: `DENY`
- **X-Content-Type-Options**: `nosniff`
- **Referrer-Policy**: `strict-origin-when-cross-origin`
- **HSTS**: Strict Transport Security enabled

### Input Validation

- Request body size limit: **10 MB**
- Zod schema validation on all endpoints
- Key sanitization (removes control characters)
- Pattern validation for API keys and URLs

### Logging

- **Secret values are never logged**
- Only metadata (key names, counts) logged
- Error messages redact sensitive information

## Development

### Scripts

```bash
npm run dev         # Development server (http://localhost:3000)
npm run build       # Production build
npm start           # Start production server
npm test            # Run tests with Vitest
npm run typecheck   # TypeScript type checking
npm run lint        # ESLint
```

### Project Structure

```
envsmith/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── generate-env/  # .env generation
│   │   ├── github/        # GitHub integration
│   │   └── vercel/        # Vercel integration
│   ├── page.tsx           # Main UI
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ChatComposer.tsx   # Template selection UI
│   ├── SecretsTable.tsx   # Variable editor
│   ├── GitHubSync.tsx     # GitHub sync UI
│   └── VercelSync.tsx     # Vercel sync UI
├── lib/                   # Core libraries
│   ├── templates.ts       # Template definitions
│   ├── envgen.ts          # .env generation logic
│   ├── github.ts          # GitHub API + encryption
│   └── vercel.ts          # Vercel API client
├── tests/                 # Vitest unit tests
├── middleware.ts          # Security middleware
├── Dockerfile             # Container build
└── README.md              # This file
```

### Adding Templates

Edit `lib/templates.ts`:

```typescript
export const TEMPLATES: Record<string, StackTemplate> = {
  'my-stack': {
    name: 'My Stack',
    description: 'Description here',
    variables: [
      {
        key: 'MY_VAR',
        description: 'Variable description',
        required: true,
        pattern: /^regex-pattern$/,
        placeholder: 'example-value',
      },
    ],
  },
  // ...
};
```

### Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm test -- --coverage
```

Tests cover:
- `.env` generation and parsing
- Key sanitization and validation
- GitHub secret encryption (libsodium)
- Vercel payload formatting

## Deployment

### Vercel

1. **Connect repository** to Vercel
2. **Set environment variables** (optional):
   ```
   VERCEL_TEAM_SLUG=your-team
   VERCEL_PROJECT_NAME=your-project
   ```
3. **Deploy**: Push to your main branch

Vercel will automatically:
- Install dependencies
- Run `next build`
- Deploy to production

### Docker

```bash
# Build
docker build -t envsmith .

# Run
docker run -p 3000:3000 \
  -e VERCEL_TEAM_SLUG=your-team \
  -e VERCEL_PROJECT_NAME=your-project \
  envsmith
```

### Other Platforms

Compatible with any Node.js hosting platform:
- Railway
- Render
- Fly.io
- Google Cloud Run
- AWS Elastic Beanstalk

## Troubleshooting

### GitHub Token Issues

**Error: "Token requires repo scope"**

- Generate a new PAT with `repo` scope at [github.com/settings/tokens](https://github.com/settings/tokens)
- For environment secrets, ensure the environment exists in your repository

**Error: "Environment not found"**

- Create the environment in your repository settings first
- Go to: `Settings` → `Environments` → `New environment`

### Vercel Sync Fails

**Error: "Project not found"**

- Verify project name matches exactly (case-sensitive)
- Ensure token has access to the team/project
- Check team slug is correct

**Error: "Insufficient permissions"**

- Regenerate token with `Read and Write` scope for Projects
- Add token to the correct team context

### Build Errors

**Module not found**

```bash
rm -rf node_modules package-lock.json
npm install
```

**TypeScript errors**

```bash
npm run typecheck
```

## License

MIT License - See LICENSE file for details

## Security Disclosure

If you discover a security vulnerability, please email security@example.com instead of using the issue tracker.

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure `npm test` and `npm run typecheck` pass
5. Submit a pull request

---

**EnvSmith** - Secure environment variable management without the hassle.
