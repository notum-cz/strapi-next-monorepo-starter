# 🚀 APPLY DATABASE MIGRATIONS NOW - 2 MINUTES

## ⚡ QUICK METHOD (Recommended)

### **STEP 1: Open Supabase SQL Editor**

Click this link (will open in new tab):
```
https://supabase.com/dashboard/project/sbbuxnyvflczfzvsglpe/sql/new
```

---

### **STEP 2: Run First Migration**

1. **Copy the ENTIRE file contents** from:
   ```
   supabase/migrations/20250120_initial_schema.sql
   ```

2. **Paste into SQL Editor** (the big text box)

3. **Click RUN** (bottom right corner)

4. **Wait** for "Success. No rows returned" message (~5 seconds)

✅ **Expected Result:** Green success message

---

### **STEP 3: Run Second Migration**

1. **Copy the ENTIRE file contents** from:
   ```
   supabase/migrations/20250120_impact_tracking.sql
   ```

2. **Paste into SQL Editor** (replace previous SQL)

3. **Click RUN** (bottom right corner)

4. **Wait** for "Success. No rows returned" message (~3 seconds)

✅ **Expected Result:** Green success message

---

### **STEP 4: Verify It Worked**

Run this query in the SQL Editor:

```sql
-- Check agents
SELECT name, display_name, type, status FROM public.agents;
```

**Click RUN**

✅ **You should see 6 rows:**
- sirius - Sirius - The Navigator
- andromeda - Andromeda - The Coder
- vega - Vega - The Validator
- rigel - Rigel - The Researcher
- cassiopeia - Cassiopeia - The Communicator
- betelgeuse - Betelgeuse - The Builder

---

Run this query:

```sql
-- Check projects
SELECT name, status, partner_organization FROM public.impact_projects;
```

**Click RUN**

✅ **You should see 5 rows:**
- AI-Powered Reading Program (active) - Paul Allen Institute for AI
- Urban Farm Tech Initiative (active) - Microsoft for Nonprofits
- Code.org Partnership (active) - Code.org
- AI Ethics Education (completed) - Paul Allen Institute for AI
- Climate Data Platform (active) - Microsoft AI for Earth

---

## ✅ SUCCESS!

If you see those results, your database is ready!

**What was created:**
- ✅ 19 database tables
- ✅ 6 AI agents
- ✅ 5 impact projects
- ✅ 5 partnerships
- ✅ 5 blog posts
- ✅ 4 tutorials
- ✅ All indexes and triggers
- ✅ Row Level Security enabled

---

## 🎯 NEXT STEPS

Now that database is ready:

**1. Start RedPlanet CORE** (2 min)
```
1. Open: services/redplanet-core/.env
2. Add your OpenAI API key (line 42)
3. Run: cd services/redplanet-core && start-core.bat
4. Visit: http://localhost:3033
```

**2. Add AI API Keys** (5 min)
```
Get keys from:
- OpenAI: https://platform.openai.com/api-keys
- Anthropic: https://console.anthropic.com/settings/keys
- Google: https://aistudio.google.com/app/apikey

Add to Vercel:
https://vercel.com/jeremy-bowers-s-projects/strapi-template-new-world-kids/settings/environment-variables
```

**3. Test Locally** (5 min)
```
cd apps/web
npm run dev
Visit: http://localhost:3000
```

**4. Deploy** (10 min)
```
Already on Vercel!
Just redeploy after adding API keys
```

---

## 🐛 TROUBLESHOOTING

### Error: "relation already exists"
This is OK! It means tables are already created. Skip to Step 4 to verify.

### Error: "permission denied"
Make sure you're logged into Supabase dashboard as the project owner.

### Error: "syntax error"
Make sure you copied the ENTIRE file (including first line: `-- =====`)

### Can't find SQL files?
They're in: `supabase/migrations/` folder in this project

---

## 📞 NEED THE SQL FILES?

**Migration 1 Location:**
```
C:\Users\Trevor\strapi-template-new-world-kids\supabase\migrations\20250120_initial_schema.sql
```

**Migration 2 Location:**
```
C:\Users\Trevor\strapi-template-new-world-kids\supabase\migrations\20250120_impact_tracking.sql
```

**Or use VS Code:**
1. Open this project in VS Code
2. Press `Ctrl+P`
3. Type: `20250120_initial_schema.sql`
4. Press Enter
5. Press `Ctrl+A` to select all
6. Press `Ctrl+C` to copy
7. Paste into Supabase SQL Editor

---

## ⏱️ TOTAL TIME: 2 MINUTES

**Step 1:** 10 seconds (open SQL editor)
**Step 2:** 30 seconds (copy + paste + run)
**Step 3:** 30 seconds (copy + paste + run)
**Step 4:** 50 seconds (verify with 2 queries)

**Done!** ✅

---

**Ready? Open the SQL Editor and let's go!**
👉 https://supabase.com/dashboard/project/sbbuxnyvflczfzvsglpe/sql/new
