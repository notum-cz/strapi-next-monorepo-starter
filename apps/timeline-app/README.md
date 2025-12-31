# New World Kids Interactive Timeline

An AI-powered, interactive timeline built with **CopilotKit Agent-to-UI**, showcasing the journey of Proyecto Indigo Azul from 2020 to 2035.

## Overview

This application is a **living, generative timeline** where AI dynamically creates interactive components based on real data. It features:

- **Dynamic UI generation** powered by CopilotKit
- **Interactive stage cards** with galleries, documents, and metrics
- **AI-powered chat** with fact-checking against verified sources
- **Real-time file uploads** for photos and documents
- **Responsive design** optimized for all devices
- **Accessibility-first** with keyboard navigation and ARIA labels

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **AI**: CopilotKit Agent-to-UI
- **CMS**: Strapi (headless CMS for content management)
- **Styling**: Tailwind CSS
- **State**: SWR for data fetching
- **File Upload**: React Dropzone
- **Type Safety**: TypeScript

## Project Structure

```
apps/timeline-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API routes
│   │   │   ├── timeline/       # Timeline data endpoints
│   │   │   ├── upload/         # File upload handlers
│   │   │   └── copilot/        # CopilotKit runtime
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Main timeline page
│   ├── components/
│   │   ├── timeline/           # Timeline components
│   │   │   ├── TimelineContainer.tsx
│   │   │   └── StageCard.tsx
│   │   ├── modals/             # Modal components
│   │   │   └── StageModal.tsx
│   │   └── panels/             # Tab panel components
│   │       ├── PhotoGallery.tsx
│   │       ├── DocumentViewer.tsx
│   │       ├── PeoplePanel.tsx
│   │       ├── ChatPanel.tsx
│   │       └── MetricsPanel.tsx
│   ├── hooks/                  # Custom React hooks
│   │   ├── useTimeline.ts
│   │   ├── useStageData.ts
│   │   └── useUpload.ts
│   ├── lib/                    # Core library
│   │   ├── types.ts            # TypeScript types
│   │   ├── constants.ts        # App constants
│   │   ├── strapi-client.ts    # Strapi API client
│   │   ├── copilot-tools.ts    # CopilotKit tool definitions
│   │   └── fact-check.ts       # Fact-checking & validation
│   └── styles/
│       └── globals.css         # Global styles
├── public/
│   ├── assets/                 # Static assets
│   └── data/                   # Timeline markdown source
│       └── timeline.md
├── .env.example                # Environment variables template
├── next.config.mjs             # Next.js configuration
├── tailwind.config.ts          # Tailwind configuration
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Strapi CMS instance (local or hosted)
- CopilotKit API key

### Installation

1. **Clone the repository**

```bash
git clone <repo-url>
cd apps/timeline-app
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Copy `.env.example` to `.env.local` and configure:

```env
# Copilot Configuration
NEXT_PUBLIC_COPILOTKIT_PUBLIC_API_KEY=your_key_here
COPILOTKIT_RUNTIME_URL=/api/copilot

# Strapi Configuration
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=your_token_here

# Feature Flags
ENABLE_USER_UPLOADS=true
ENABLE_ADMIN_PANEL=true
```

4. **Set up Strapi collections**

Create the following content types in your Strapi instance:

- `timeline-stage` (see [docs/STRAPI_SCHEMA.md](docs/STRAPI_SCHEMA.md))
- `timeline-person`
- `timeline-metric`
- `timeline-document`

5. **Add timeline markdown**

Place your complete timeline markdown in `public/data/timeline.md`. This serves as the source of truth for fact-checking.

6. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) to view the timeline.

## Key Features

### 1. AI-Driven Component Generation

The CopilotKit agent generates UI components dynamically based on data:

- Stage cards render with layout optimized for content
- Modal tabs appear based on available data
- Chat responses synthesize markdown + Strapi data

### 2. Fact-Checking System

Every AI response is validated against:

- **Markdown timeline** (source of truth)
- **Strapi CMS data** (user-managed content)
- **Hallucination detection** (pattern matching)

See [src/lib/fact-check.ts](src/lib/fact-check.ts) for implementation.

### 3. Interactive Components

- **TimelineContainer**: Horizontal scrollable timeline with keyboard navigation
- **StageCard**: Interactive cards with hover states and metrics
- **StageModal**: 5-tab system (Gallery, Documents, People, Chat, Metrics)
- **PhotoGallery**: Lightbox with upload for admins
- **ChatPanel**: AI chat with pre-seeded questions
- **MetricsPanel**: Visualizations for progress tracking

### 4. File Upload

Admins can upload photos and documents directly:

- Drag-and-drop interface
- Progress tracking
- File validation (type, size)
- Real-time UI updates

### 5. Accessibility

- Keyboard navigation (arrow keys, tab, enter)
- ARIA labels and roles
- Focus indicators
- Screen reader support
- Reduced motion support

## Development

### Adding a New Stage

1. Add stage data to Strapi CMS
2. Update markdown timeline in `public/data/timeline.md`
3. (Optional) Add pre-seeded questions in `src/lib/constants.ts`

### Customizing Styles

Brand colors and spacing are defined in:

- `tailwind.config.ts` for Tailwind classes
- `src/styles/globals.css` for global CSS variables

### Adding CopilotKit Tools

Tools are defined in `src/lib/copilot-tools.ts`. Example:

```typescript
{
  name: 'myTool',
  description: 'What this tool does',
  input: { type: 'object', properties: { ... } },
  handler: async (input) => { ... }
}
```

## Deployment

### Option A: Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

Set environment variables in Vercel dashboard.

### Option B: Standalone Build

```bash
npm run build
npm run start
```

### Option C: Embed in Main Site

Import and use as a React component:

```tsx
import { TimelineApp } from '@nwkids/timeline-app';

export default function JourneyPage() {
  return <TimelineApp />;
}
```

See [docs/EMBEDDING.md](docs/EMBEDDING.md) for details.

## API Endpoints

- `GET /api/timeline/stages` - All stages
- `GET /api/timeline/stages/[id]` - Stage details
- `GET /api/timeline/stages/[id]/gallery` - Gallery photos
- `GET /api/timeline/stages/[id]/documents` - Documents
- `GET /api/timeline/stages/[id]/people` - People
- `GET /api/timeline/metrics/[id]` - Metrics
- `POST /api/upload/gallery/[id]` - Upload photo
- `POST /api/upload/documents/[id]` - Upload document

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

Copyright © 2024 New World Kids. All rights reserved.

## Support

For questions or issues:
- Email: support@newworldkids.org
- GitHub Issues: [Create an issue](https://github.com/newworldkids/timeline/issues)

---

**Built with ❤️ using [CopilotKit](https://copilotkit.ai)**
