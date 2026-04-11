# Events Collection Type Structure

## How to Create in Your Strapi Admin

**URL:** https://backend.apps.viswam.ai/admin/plugins/content-type-builder/content-types/api::event.event

### Step 1: Create Collection Type

- **Display name:** Event
- **API ID:** event
- **Collection name:** events

### Step 2: Add Fields

#### Basic Information

1. **title** (String)
   - Required: ✅ Yes
   - Unique: ❌ No
   - Translatable: ✅ Yes (enable i18n)

2. **slug** (String)
   - Required: ✅ Yes
   - Unique: ✅ Yes
   - Translatable: ❌ No

3. **date** (Date)
   - Required: ✅ Yes
   - Date type: Date

4. **time** (Time)
   - Required: ❌ No

5. **location** (String)
   - Required: ❌ No
   - Translatable: ✅ Yes (enable i18n)

6. **description** (Rich Text)
   - Required: ❌ No
   - Translatable: ✅ Yes (enable i18n)

#### Media

7. **image** (Media)
   - Required: ❌ No
   - Multiple: ❌ No
   - Allowed types: Images

#### Links and Actions

8. **cta_link** (Component)
   - Component: utilities.link
   - Required: ❌ No
   - Repeatable: ❌ No

#### Categorization

9. **tags** (Component)
   - Component: utilities.text
   - Required: ❌ No
   - Repeatable: ✅ Yes

#### Additional Options

10. **event_type** (Enumeration)
    - Options: ["Conference", "Workshop", "Webinar", "Meetup", "Training", "Other"]
    - Required: ❌ No

11. **registration_required** (Boolean)
    - Default: false
    - Required: ❌ No

12. **registration_link** (String)
    - Required: ❌ No
    - Translatable: ❌ No

13. **featured** (Boolean)
    - Default: false
    - Required: ❌ No

14. **capacity** (Integer)
    - Required: ❌ No
    - Min value: 1

15. **price** (Decimal)
    - Required: ❌ No
    - Min value: 0

### Step 3: Configure Advanced Settings

#### General

- **Draft & Publish:** ✅ Enabled
- **Description:** "Event management for your website"

#### i18n (Internationalization)

- **Localized:** ✅ Yes
- **Fields to translate:**
  - title
  - location
  - description

### Step 4: Save and Generate API

Click **Save** to create the collection type. Strapi will automatically:

- Generate the database schema
- Create API endpoints
- Update TypeScript types

## API Endpoints Generated

After creation, you'll have these endpoints:

### GET Endpoints

- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get single event
- `GET /api/events/slug/:slug` - Get event by slug

### POST Endpoints

- `POST /api/events` - Create new event

### PUT Endpoints

- `PUT /api/events/:id` - Update event

### DELETE Endpoints

- `DELETE /api/events/:id` - Delete event

## Example API Usage

### Get All Events

```bash
curl "https://backend.apps.viswam.ai/api/events?populate=*"
```

### Get Single Event

```bash
curl "https://backend.apps.viswam.ai/api/events/1?populate=*"
```

### Create New Event

```bash
curl -X POST "https://backend.apps.viswam.ai/api/events" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "title": "Tech Conference 2024",
      "slug": "tech-conference-2024",
      "date": "2024-06-15",
      "time": "09:00:00",
      "location": "San Francisco, CA",
      "description": "Annual technology conference",
      "event_type": "Conference",
      "registration_required": true,
      "featured": true
    }
  }'
```

## Frontend Integration

Once created, you can fetch events in your frontend:

```javascript
// Example fetch function
const fetchEvents = async () => {
  const response = await fetch(
    "https://backend.apps.viswam.ai/api/events?populate=*"
  )
  const data = await response.json()
  return data.data
}
```

## Notes

1. **Enable i18n** for translatable fields if you need multiple languages
2. **Set proper permissions** in Settings → Users & Permissions Plugin
3. **Configure media upload** settings if using images
4. **Test the API** using the API Documentation at `/admin/plugins/documentation`

Would you like me to create the frontend React component to display these events once you've created the collection type in your Strapi admin?
