# 🎮 Mascarpone Strapi - Personal Portfolio & CV Platform

A modern personal portfolio built with Strapi v5 & Next.js v15.

## 🌟 Live Demo

- **Portfolio**: [Your Live URL Here]
- **Admin Panel**: [Your Strapi Admin URL Here]

## 🎯 Project Overview

This is a personalized version of the Strapi-Next.js monorepo starter, customized for **Tomas Skarpa** as a professional portfolio and CV platform.

## 🛠 Tech Stack

- **Backend**: [Strapi v5](https://strapi.io/) - Headless CMS for content management
- **Frontend**: [Next.js v15](https://nextjs.org/) - React framework with App Router
- **UI Components**: [Shadcn/ui](https://ui.shadcn.com/) - TailwindCSS-based component library
- **Styling**: [TailwindCSS v4](https://tailwindcss.com/) - Utility-first CSS framework
- **Monorepo**: [Turborepo](https://turbo.build/) - Build system and task runner
- **Database**: PostgreSQL (via Docker)
- **Authentication**: JWT with Strapi Users & Permissions
- **Deployment**: Heroku-ready configuration

## 🌠 Unique Features

### Enhanced Components

- **Quote Carousel**: Rotating inspirational quotes with smooth transitions
- **Adaptive Gallery**: Responsive image galleries with lightbox functionality
- **Timeline**: Professional experience and milestone visualization

### Content Management

- **Page Builder**: Drag-and-drop content creation
- **Multi-language Support**: Internationalization with next-intl
- **Live Preview**: Real-time content preview in development
- **Media Management**: Optimized image handling with Next.js Image

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 22.x
- Yarn 1.22.x
- [nvm](https://github.com/nvm-sh/nvm) (recommended)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/TomasSkarpa/mascarpone-strapi
cd mascarpone-strapi
```

2. **Install dependencies**

```bash
# Switch to correct Node.js version
nvm use

# Install all dependencies
yarn
```

3. **Set up environment files**

```bash
# Copy example environment files
yarn setup:apps
```

4. **Configure Strapi API tokens**

   - Follow the [UI README](apps/ui/README.md#environment-variables) for API token setup
   - This is required for frontend-backend communication

5. **Start development servers**

```bash
# Start all applications
yarn dev

# Or start individually
yarn dev:strapi  # Strapi CMS at http://localhost:1337
yarn dev:ui      # Next.js app at http://localhost:3000
```

## 📁 Project Structure

```
mascarpone-strapi/
├── apps/
│   ├── strapi/          # Strapi CMS backend
│   │   ├── src/
│   │   │   ├── api/     # API endpoints
│   │   │   ├── components/  # Reusable content components
│   │   │   └── extensions/  # Custom Strapi extensions
│   │   └── config/      # Strapi configuration
│   └── ui/              # Next.js frontend
│       ├── src/
│       │   ├── app/     # App Router pages
│       │   ├── components/  # React components
│       │   │   └── page-builder/  # CMS content components
│       │   └── lib/     # Utilities and API clients
│       └── locales/     # Internationalization files
├── packages/
│   ├── design-system/   # Shared design tokens
│   ├── eslint-config/   # ESLint configurations
│   ├── prettier-config/ # Prettier configuration
│   ├── shared-data/     # Common data types
│   └── typescript-config/  # TypeScript configurations
└── scripts/             # Build and deployment scripts
```

## 🔧 Development Scripts

```bash
# Development
yarn dev                 # Start all apps in development
yarn dev:ui             # Start only Next.js app
yarn dev:strapi         # Start only Strapi CMS

# Building
yarn build              # Build all applications
yarn build:ui           # Build Next.js app
yarn build:strapi       # Build Strapi app

# Code Quality
yarn lint               # Run ESLint on all packages
yarn format             # Format code with Prettier
yarn commit             # Interactive commit with Commitizen

# Utilities
yarn setup:apps         # Copy environment example files
```

## 🌍 Deployment

### Heroku Deployment

The project is configured for Heroku deployment with automatic app detection:

1. **Set environment variables** in Heroku dashboard
2. **Configure S3 bucket** for media storage (Heroku filesystem is ephemeral)
3. **Deploy** - The build script automatically detects which app to deploy

### Environment Variables

Key environment variables needed:

- `APP_PUBLIC_URL`: Frontend application URL
- `STRAPI_URL`: Strapi backend URL
- `STRAPI_REST_READONLY_API_KEY`: API key for frontend-backend communication
- Database and S3 credentials for production

## 👨‍💻 Author & Maintainer

**Tomas Skarpa**

- Email: tskarpa@seznam.cz
- Portfolio: [Your Portfolio URL]
- LinkedIn: [Your LinkedIn Profile]
- GitHub: [TomasSkarpa](https://github.com/TomasSkarpa)

## 🤝 Contributing

This is a personal portfolio project, but feedback and suggestions are welcome! Feel free to:

- Open issues for bugs or feature requests
- Submit pull requests for improvements

## 📄 License

This project is private and proprietary. Based on the open-source [strapi-next-monorepo-starter](https://github.com/notum-cz/strapi-next-monorepo-starter) template.

## 🙏 Acknowledgments

- Built upon the excellent [Strapi-Next.js Monorepo Starter](https://github.com/notum-cz/strapi-next-monorepo-starter)
- Component library powered by Shadcn/ui and Radix UI

---

_Ready for new quests! 🎮_
