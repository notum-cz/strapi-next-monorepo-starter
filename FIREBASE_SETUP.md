# Firebase Setup Guide

This project uses **Firebase** for authentication and real-time features (replacing Supabase).

---

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `new-world-kids` (or your choice)
4. Disable Google Analytics (optional for development)
5. Click "Create project"

---

## Step 2: Register Web App

1. In Firebase Console, click the **Web** icon (`</>`)
2. Register app name: `New World Kids Web`
3. Enable "Firebase Hosting" (optional)
4. Click "Register app"
5. **Copy the firebaseConfig** - you'll need these values for `.env.local`

---

## Step 3: Enable Authentication

1. In Firebase Console, go to **Build → Authentication**
2. Click "Get started"
3. Enable **Email/Password** provider
4. Click "Enable" and "Save"

---

## Step 4: Create Firestore Database

1. In Firebase Console, go to **Build → Firestore Database**
2. Click "Create database"
3. Start in **Test mode** (for development)
4. Choose location: `us-central` (or closest to your users)
5. Click "Enable"

---

## Step 5: Set Firestore Rules

Replace default rules with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // AI Conversations - users can read their own
    match /ai_conversations/{conversationId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
      allow write: if false; // Only server can write
    }

    // Donations - users can read their own
    match /donations_feed/{donationId} {
      allow read: if true; // Public read for transparency
      allow write: if false; // Only server can write
    }

    // User perks - users can read their own
    match /user_perks/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if false; // Only server can write
    }
  }
}
```

---

## Step 6: Generate Service Account Key (for backend)

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Go to **Service accounts** tab
3. Click "Generate new private key"
4. Download the JSON file
5. **IMPORTANT:** Keep this file secret! Never commit to git!

---

## Step 7: Configure Environment Variables

### Frontend (`apps/web/.env.local`)

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

### Backend (`services/ai-agents/.env`)

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"...",...}'
```

**Note:** For the service account key, copy the **entire contents** of the downloaded JSON file as a **single-line string**.

---

## Step 8: Install Firebase SDK

Already included in package.json! Just run:

```bash
# In Next.js app
cd apps/web
yarn add firebase

# In AI agents service
cd services/ai-agents
yarn add firebase-admin
```

---

## Step 9: Test Authentication

1. Start Next.js app: `yarn dev`
2. Create test user:
   - Go to Firebase Console → Authentication → Users
   - Click "Add user"
   - Email: `test@example.com`
   - Password: `test123456`
3. Test login on your app

---

## Step 10: Verify Firestore Connection

1. Make a test donation (will write to Firestore)
2. Check Firebase Console → Firestore Database
3. Should see new documents in `donations_feed` collection

---

## Security Best Practices

### ✅ DO:
- Keep service account key in environment variables
- Use Firestore security rules
- Enable Firebase App Check (production)
- Monitor Firebase usage/costs

### ❌ DON'T:
- Commit service account JSON to git
- Use admin SDK on client-side
- Leave Firestore in test mode for production
- Expose API keys in public repos

---

## Firebase vs Supabase Comparison

| Feature | Supabase (old) | Firebase (new) |
|---------|----------------|----------------|
| Auth | ✅ Email/Password | ✅ Email/Password |
| Real-time | ✅ PostgreSQL triggers | ✅ Firestore listeners |
| Database | PostgreSQL | Firestore (NoSQL) |
| Storage | ✅ S3-compatible | ✅ Cloud Storage |
| Free Tier | 500MB, 50K users | 1GB, unlimited users |
| Pricing | $25/mo (Pro) | Pay-as-you-go |

**Why Firebase?**
- Better free tier
- Real-time built-in (no setup)
- Scales automatically
- Simpler for auth + real-time use case

**What we kept:**
- PostgreSQL (for relational blockchain data)
- Strapi CMS (for content management)

---

## Troubleshooting

**Error: "Firebase app not initialized"**
- Check that all NEXT_PUBLIC_FIREBASE_* env vars are set
- Restart dev server after adding env vars

**Error: "Permission denied" in Firestore**
- Check Firestore rules
- Ensure user is authenticated
- Verify userId matches in rules

**Error: "Service account key invalid"**
- Ensure JSON is valid (single-line string)
- Check project ID matches

---

## Next Steps

- [ ] Set up Firebase Hosting (optional)
- [ ] Enable Firebase App Check (security)
- [ ] Set up Firebase Cloud Functions (for serverless features)
- [ ] Configure Firebase Storage rules
- [ ] Set up Firebase Crashlytics (mobile)

---

For more info: https://firebase.google.com/docs
