# Strapi Content Type Schemas

This document describes the Strapi content types required for the Interactive Timeline application.

## Overview

The timeline requires 4 main content types:

1. **timeline-stage** - Main timeline stages (seasons)
2. **timeline-person** - People and partners involved
3. **timeline-metric** - Measurable outcomes and progress
4. **timeline-document** - Documents, videos, and files

## Content Type Definitions

### 1. timeline-stage

**Collection Type** - Main timeline stages

| Field Name | Type | Required | Options |
|------------|------|----------|---------|
| stage_id | UID (slug) | Yes | Auto-generate from title |
| title | Short Text | Yes | e.g., "Season 1: Foundation" |
| date_range | Short Text | Yes | e.g., "Jan 2020 - Dec 2020" |
| status | Enumeration | Yes | BUILT, STUBBED, PLANNED, FUTURE |
| completion_percentage | Number (Integer) | No | 0-100 |
| description | Rich Text | Yes | Stage overview |
| featured_image | Media (Single) | No | Main stage image |
| gallery_images | Media (Multiple) | No | Photo gallery |
| documents | Relation | No | Has many timeline-document |
| people | Relation | No | Has many timeline-person (many-to-many) |
| metrics | Relation | No | Has many timeline-metric |
| metadata | JSON | No | Custom fields per stage |
| published_at | Datetime | No | Publication date |

**API Endpoints:**
- `GET /api/timeline-stages` - List all stages
- `GET /api/timeline-stages/:id` - Get single stage
- `POST /api/timeline-stages` - Create stage (admin only)
- `PUT /api/timeline-stages/:id` - Update stage (admin only)

---

### 2. timeline-person

**Collection Type** - People involved in stages

| Field Name | Type | Required | Options |
|------------|------|----------|---------|
| name | Short Text | Yes | Full name |
| role | Short Text | Yes | e.g., "Founder", "Volunteer" |
| bio | Rich Text | No | Person's biography |
| avatar | Media (Single) | No | Profile photo |
| email | Email | No | Contact email |
| website | URL | No | Personal/company website |
| location | Short Text | No | City, Country |
| stages_involved | Relation | No | Many-to-many with timeline-stage |
| social_links | JSON | No | `{ twitter, linkedin, facebook, instagram }` |

**Example Social Links JSON:**
```json
{
  "twitter": "https://twitter.com/username",
  "linkedin": "https://linkedin.com/in/username",
  "facebook": "https://facebook.com/username",
  "instagram": "https://instagram.com/username"
}
```

**API Endpoints:**
- `GET /api/timeline-people` - List all people
- `GET /api/timeline-people/:id` - Get single person
- `GET /api/timeline-people?filters[stages_involved][stage_id][$eq]=season-1` - Get people for stage

---

### 3. timeline-metric

**Collection Type** - Measurable outcomes

| Field Name | Type | Required | Options |
|------------|------|----------|---------|
| label | Short Text | Yes | Metric name |
| start_value | Short Text | Yes | Starting value (can be text or number) |
| end_value | Short Text | Yes | Ending value |
| icon | Short Text | No | Emoji or icon name |
| stage | Relation | Yes | Belongs to timeline-stage |
| category | Enumeration | Yes | Land, People, Financial, Impact |
| visualization_type | Enumeration | Yes | bar, number, progress, icon |

**Example Metrics:**

```json
[
  {
    "label": "Land Acquired",
    "start_value": "0 acres",
    "end_value": "25 acres",
    "icon": "🌱",
    "category": "Land",
    "visualization_type": "bar"
  },
  {
    "label": "Volunteers",
    "start_value": "0",
    "end_value": "42",
    "icon": "👥",
    "category": "People",
    "visualization_type": "number"
  },
  {
    "label": "Completion",
    "start_value": "0",
    "end_value": "85",
    "icon": "✓",
    "category": "Impact",
    "visualization_type": "progress"
  }
]
```

**API Endpoints:**
- `GET /api/timeline-metrics` - List all metrics
- `GET /api/timeline-metrics?filters[stage][stage_id][$eq]=season-1` - Get metrics for stage

---

### 4. timeline-document

**Collection Type** - Documents and media files

| Field Name | Type | Required | Options |
|------------|------|----------|---------|
| title | Short Text | Yes | Document name |
| description | Rich Text | No | Document description |
| file | Media (Single) | No | The actual file |
| document_type | Enumeration | Yes | Budget, Plan, Partnership, Impact, Video, Photo |
| stage | Relation | Yes | Belongs to timeline-stage |
| visibility | Enumeration | Yes | Public, AdminOnly, AuthorizedOnly |
| published_at | Datetime | No | Publication date |

**Document Types:**

- **Budget** - Financial documents, budgets, fundraising plans
- **Plan** - Strategic plans, roadmaps, blueprints
- **Partnership** - Partnership agreements, MOUs
- **Impact** - Impact reports, case studies
- **Video** - Video content (MP4, WebM)
- **Photo** - High-resolution photos

**API Endpoints:**
- `GET /api/timeline-documents` - List all documents
- `GET /api/timeline-documents?filters[stage][stage_id][$eq]=season-1` - Get documents for stage

---

## Permissions & Roles

### Public Role (Unauthenticated)

**timeline-stage:**
- `find` ✅
- `findOne` ✅

**timeline-person:**
- `find` ✅
- `findOne` ✅

**timeline-metric:**
- `find` ✅
- `findOne` ✅

**timeline-document:**
- `find` ✅ (only where `visibility` = "Public")
- `findOne` ✅ (only where `visibility` = "Public")

**upload:**
- `upload` ❌

### Authenticated Role

**timeline-stage:**
- `find` ✅
- `findOne` ✅
- `create` ❌
- `update` ❌
- `delete` ❌

**timeline-person:**
- `find` ✅
- `findOne` ✅

**timeline-metric:**
- `find` ✅
- `findOne` ✅

**timeline-document:**
- `find` ✅ (all visibility levels)
- `findOne` ✅ (all visibility levels)

**upload:**
- `upload` ❌

### Admin Role

All permissions ✅

### Editor Role (Custom - Optional)

**timeline-stage:**
- `find` ✅
- `findOne` ✅
- `create` ✅
- `update` ✅
- `delete` ❌

**timeline-person:**
- All ✅

**timeline-metric:**
- All ✅

**timeline-document:**
- All ✅

**upload:**
- `upload` ✅
- `destroy` ❌ (admin only)

---

## Setup Instructions

### 1. Install Strapi

```bash
npx create-strapi-app@latest strapi-timeline --quickstart
cd strapi-timeline
```

### 2. Create Content Types

Navigate to **Content-Type Builder** in Strapi admin panel and create each content type according to the schemas above.

### 3. Configure Permissions

1. Go to **Settings → Roles**
2. Configure Public, Authenticated, and Admin roles as specified above
3. (Optional) Create custom "Editor" role for content managers

### 4. Generate API Token

1. Go to **Settings → API Tokens**
2. Create new token with:
   - Name: "Timeline App"
   - Type: Read-Only (or Full Access if using uploads)
   - Duration: Unlimited
3. Copy token and add to `.env.local` as `STRAPI_API_TOKEN`

### 5. Seed Initial Data

Use the Strapi admin panel to create:
- 6-7 timeline stages (prologue → season 6)
- Key people involved in each stage
- Metrics for each stage
- Upload featured images and gallery photos

### 6. Configure CORS (if needed)

In `config/middlewares.js`:

```javascript
module.exports = [
  // ...
  {
    name: 'strapi::cors',
    config: {
      origin: ['http://localhost:3001', 'https://timeline.yourdomain.com'],
      headers: '*',
    },
  },
  // ...
];
```

---

## Example Data Structure

### Example Stage JSON

```json
{
  "stage_id": "season-1",
  "title": "Season 1: Foundation",
  "date_range": "January 2020 - December 2020",
  "status": "BUILT",
  "completion_percentage": 100,
  "description": "The beginning of our journey...",
  "featured_image": { "url": "/uploads/season1_featured.jpg" },
  "gallery_images": [
    { "url": "/uploads/gallery1.jpg", "caption": "Breaking ground" },
    { "url": "/uploads/gallery2.jpg", "caption": "First volunteers" }
  ],
  "people": [
    { "name": "John Doe", "role": "Founder" },
    { "name": "Jane Smith", "role": "Volunteer Coordinator" }
  ],
  "metrics": [
    {
      "label": "Land Acquired",
      "start_value": "0 acres",
      "end_value": "25 acres",
      "category": "Land",
      "visualization_type": "bar"
    }
  ],
  "documents": [
    {
      "title": "Season 1 Budget",
      "document_type": "Budget",
      "file": { "url": "/uploads/budget.pdf" }
    }
  ]
}
```

---

## Troubleshooting

### Issue: "Forbidden" errors when fetching data

**Solution:** Check that Public role has `find` and `findOne` permissions for all content types.

### Issue: Images not loading

**Solution:**
1. Check CORS configuration in Strapi
2. Verify `NEXT_PUBLIC_STRAPI_URL` in `.env.local`
3. Check that media URLs are accessible

### Issue: Upload endpoint returns 401

**Solution:** Ensure `STRAPI_API_TOKEN` has write permissions and is correctly set.

---

## Additional Resources

- [Strapi Documentation](https://docs.strapi.io)
- [Strapi Content Types Guide](https://docs.strapi.io/dev-docs/backend-customization/models)
- [Strapi API Reference](https://docs.strapi.io/dev-docs/api/rest)
