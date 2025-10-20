# Supabase MCP Integration

**Status**: Ready to Connect
**Purpose**: Direct database access and management via Claude Code

---

## MCP Configuration

The Supabase MCP server allows Claude Code to directly interact with your Supabase database for queries, schema management, and real-time monitoring.

### Connection Details

**MCP Server URL**: `https://mcp.supabase.com/mcp`
**Project ID**: `sbbuxnyvflczfzvsglpe`
**Project URL**: `https://sbbuxnyvflczfzvsglpe.supabase.co`

---

## Setup Instructions

### Option 1: Claude Code Settings (Recommended)

1. **Open Claude Code Settings**
   - Press `Ctrl+,` (or `Cmd+,` on Mac)
   - Search for "MCP"

2. **Add MCP Server Configuration**

Add this to your Claude Code settings (`settings.json`):

```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp",
      "headers": {
        "Authorization": "Bearer <YOUR_SUPABASE_SERVICE_ROLE_KEY>"
      }
    }
  }
}
```

3. **Get Your Service Role Key**
   - Go to: https://supabase.com/dashboard/project/sbbuxnyvflczfzvsglpe
   - Click "Project Settings" → "API"
   - Copy the `service_role` key (keep it secret!)
   - Replace `<YOUR_SUPABASE_SERVICE_ROLE_KEY>` in the config above

4. **Reload Claude Code**
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P`)
   - Type "Reload Window"
   - Press Enter

### Option 2: MCP Configuration File

Alternatively, create `.claude/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_SUPABASE_SERVICE_ROLE_KEY"
      }
    }
  }
}
```

**Important**: Add `.claude/mcp.json` to `.gitignore` to protect your keys!

---

## What You Can Do With Supabase MCP

Once connected, you can ask Claude Code to:

### 1. Query Database
```
"Show me all donations from the last 7 days"
"Count how many AI conversations we have"
"Find users with the most perks"
```

### 2. Schema Management
```
"Show me the schema for the ai_conversations table"
"Add an index on created_at for donations_feed"
"Alter user_perks table to add a new column"
```

### 3. Real-time Monitoring
```
"Show me live donations as they come in"
"Monitor AI conversation activity"
"Watch for new user signups"
```

### 4. Data Analysis
```
"What's the average donation amount?"
"Show me donation trends by day"
"Who are the top 10 donors?"
```

### 5. Database Setup
```
"Create the tables from DEPLOYMENT_SETUP.md"
"Enable Row Level Security on all tables"
"Set up the RLS policies for donations_feed"
```

---

## Example Usage

### Create Tables Automatically

**You**: "Use the Supabase MCP to create all the tables from docs/DEPLOYMENT_SETUP.md"

**Claude Code** will:
1. Read the SQL schema from the deployment guide
2. Connect to your Supabase database via MCP
3. Execute the CREATE TABLE statements
4. Set up indexes and constraints
5. Confirm completion

### Monitor Live Data

**You**: "Show me donations in real-time using Supabase MCP"

**Claude Code** will:
1. Connect to the donations_feed table
2. Subscribe to real-time changes
3. Display new donations as they arrive
4. Format the output nicely

### Quick Database Queries

**You**: "How many AI conversations happened today?"

**Claude Code** will:
1. Query ai_conversations table
2. Filter by today's date
3. Count the results
4. Return the number

---

## Security Best Practices

### ✅ DO:
- Store service_role key in environment variables
- Add mcp.json to .gitignore
- Use Row Level Security (RLS) for all tables
- Rotate keys regularly
- Use different keys for dev/prod

### ❌ DON'T:
- Commit keys to git
- Share service_role key publicly
- Use anon key for MCP (won't work)
- Bypass RLS policies carelessly
- Use production keys in development

---

## Troubleshooting

### "MCP Server Not Found"
- Check that the URL is correct: `https://mcp.supabase.com/mcp`
- Verify Claude Code settings are saved
- Reload the window

### "Authentication Failed"
- Verify you're using the `service_role` key, not `anon` key
- Check the key hasn't expired
- Ensure the Authorization header format is correct

### "Connection Timeout"
- Check your internet connection
- Verify Supabase project is active
- Try accessing Supabase dashboard directly

### "Permission Denied"
- Service role key should have full access
- Check RLS policies aren't blocking queries
- Verify the table exists

---

## MCP Capabilities

The Supabase MCP server provides these tools:

### Database Tools
- `query` - Execute SQL queries
- `insert` - Insert data into tables
- `update` - Update existing rows
- `delete` - Delete rows
- `schema` - View table schemas

### Real-time Tools
- `subscribe` - Subscribe to table changes
- `unsubscribe` - Stop listening to changes
- `broadcast` - Send real-time messages

### Management Tools
- `createTable` - Create new tables
- `alterTable` - Modify table structure
- `createIndex` - Add database indexes
- `enableRLS` - Enable Row Level Security
- `createPolicy` - Create RLS policies

---

## Integration with Our Services

### AI Agents Service
```typescript
// services/ai-agents/src/config/supabase.ts
// Already configured! MCP can access the same tables
```

### Blockchain Service
```typescript
// services/blockchain/src/config/supabase.ts
// Already configured! MCP can monitor donations_feed
```

### Web App
```typescript
// apps/web/src/lib/supabase/client.ts
// MCP can help debug client-side queries
```

---

## Quick Start Checklist

- [ ] Get Supabase service_role key from dashboard
- [ ] Add MCP configuration to Claude Code settings
- [ ] Reload Claude Code window
- [ ] Test connection: "Query Supabase for all table names"
- [ ] Create tables: "Create tables from DEPLOYMENT_SETUP.md"
- [ ] Enable RLS: "Set up RLS policies from deployment guide"
- [ ] Test queries: "Show me the schema for ai_conversations"

---

## Next Steps After MCP Setup

1. **Create Database Schema**
   ```
   "Use Supabase MCP to create all tables from docs/DEPLOYMENT_SETUP.md"
   ```

2. **Enable Security**
   ```
   "Enable Row Level Security on all tables and create the policies"
   ```

3. **Enable Realtime**
   ```
   "Enable realtime replication for the donations_feed table"
   ```

4. **Test Connection**
   ```
   "Insert a test AI conversation and then retrieve it"
   ```

5. **Monitor Activity**
   ```
   "Show me real-time activity on all tables"
   ```

---

## Documentation References

- [Supabase MCP Documentation](https://github.com/supabase/mcp-server-supabase)
- [Model Context Protocol Spec](https://modelcontextprotocol.io/)
- [Our Deployment Guide](DEPLOYMENT_SETUP.md)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

**Status**: Configuration ready, waiting for service_role key
**Next**: Add key to settings → Reload → Start using MCP! 🚀
