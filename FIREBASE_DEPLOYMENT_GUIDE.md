# 🔥 FIREBASE & GOOGLE CLOUD DEPLOYMENT GUIDE

**Platform:** Firebase Studio + Google Cloud Run
**Project:** New World Kids Nonprofit Platform
**Status:** Ready to Deploy

---

## 🎯 DEPLOYMENT ARCHITECTURE

```
Frontend (Next.js)          Backend Services
Firebase Hosting     →      Google Cloud Run
   ↓                           ↓
Cloud CDN               Container Registry
   ↓                           ↓
Users                    Supabase Database
```

---

## 📋 PREREQUISITES

1. **Google Cloud Account** (Free tier available)
2. **Firebase Project** (Create at https://console.firebase.google.com)
3. **Google Cloud SDK** installed
4. **Node.js 22.x** installed
5. **Firebase CLI** installed

---

## 🚀 STEP 1: INSTALL TOOLS

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Install Google Cloud SDK (gcloud)
# Download from: https://cloud.google.com/sdk/docs/install

# Verify installations
firebase --version
gcloud --version
```

---

## 🔐 STEP 2: LOGIN & SETUP

```bash
# Login to Firebase
firebase login

# Login to Google Cloud
gcloud auth login

# Set your project ID
gcloud config set project YOUR_PROJECT_ID
```

---

## 📦 STEP 3: DEPLOY FRONTEND (Firebase Hosting)

### **3.1 Initialize Firebase**
```bash
# From project root
cd apps/web

# Initialize Firebase
firebase init

# Select:
# ✅ Hosting: Configure files for Firebase Hosting
# ✅ Use existing project
# ✅ Select your Firebase project

# Configuration:
# Public directory: out
# Single-page app: Yes
# Automatic builds with GitHub: Yes (optional)
```

### **3.2 Create `firebase.json`**
```json
{
  "hosting": {
    "public": "out",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp|js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

### **3.3 Build & Deploy**
```bash
# Build for production
npm run build

# Export static files
npm run export
# OR if using next.config.js with output: 'export'
# Build already creates 'out' folder

# Deploy to Firebase
firebase deploy --only hosting

# Your site is now live at:
# https://YOUR_PROJECT_ID.web.app
```

---

## 🐳 STEP 4: DEPLOY BACKEND (Google Cloud Run)

### **4.1 Enable Required APIs**
```bash
# Enable Cloud Run API
gcloud services enable run.googleapis.com

# Enable Container Registry
gcloud services enable containerregistry.googleapis.com

# Enable Cloud Build
gcloud services enable cloudbuild.googleapis.com
```

### **4.2 Deploy Stellar Agents Service**
```bash
# Navigate to service
cd services/stellar-agents

# Build and push to Container Registry
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/stellar-agents

# Deploy to Cloud Run
gcloud run deploy stellar-agents \
  --image gcr.io/YOUR_PROJECT_ID/stellar-agents \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="SUPABASE_URL=https://sbbuxnyvflczfzvsglpe.supabase.co,SUPABASE_SERVICE_ROLE_KEY=YOUR_KEY,OPENAI_API_KEY=YOUR_KEY,ANTHROPIC_API_KEY=YOUR_KEY,GOOGLE_API_KEY=YOUR_KEY" \
  --memory 512Mi \
  --timeout 60

# Note the service URL (e.g., https://stellar-agents-xxx-uc.a.run.app)
```

### **4.3 Deploy Big-3 Orchestrator**
```bash
cd ../big-3-orchestrator

gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/big-3-orchestrator

gcloud run deploy big-3-orchestrator \
  --image gcr.io/YOUR_PROJECT_ID/big-3-orchestrator \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="SUPABASE_URL=https://sbbuxnyvflczfzvsglpe.supabase.co,SUPABASE_SERVICE_ROLE_KEY=YOUR_KEY,OPENAI_API_KEY=YOUR_KEY,ANTHROPIC_API_KEY=YOUR_KEY,GOOGLE_API_KEY=YOUR_KEY" \
  --memory 512Mi
```

### **4.4 Deploy Browser Service**
```bash
cd ../browser-service

gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/browser-service

gcloud run deploy browser-service \
  --image gcr.io/YOUR_PROJECT_ID/browser-service \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="SUPABASE_URL=https://sbbuxnyvflczfzvsglpe.supabase.co,SUPABASE_SERVICE_ROLE_KEY=YOUR_KEY" \
  --memory 1Gi \
  --cpu 2
```

### **4.5 Deploy Chrome DevTools MCP**
```bash
cd ../chrome-devtools-mcp

gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/chrome-devtools-mcp

gcloud run deploy chrome-devtools-mcp \
  --image gcr.io/YOUR_PROJECT_ID/chrome-devtools-mcp \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi
```

---

## ⚙️ STEP 5: UPDATE FRONTEND ENVIRONMENT VARIABLES

### **5.1 Add Firebase Environment Config**
```bash
# Go to Firebase Console
# https://console.firebase.google.com/project/YOUR_PROJECT_ID/settings/general

# Go to "Environment Variables" section
# Add these:
NEXT_PUBLIC_SUPABASE_URL=https://sbbuxnyvflczfzvsglpe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
STELLAR_AGENTS_URL=https://stellar-agents-xxx-uc.a.run.app
BIG_3_ORCHESTRATOR_URL=https://big-3-orchestrator-xxx-uc.a.run.app
SKIP_ENV_VALIDATION=1
```

### **5.2 Redeploy Frontend**
```bash
cd apps/web
npm run build
firebase deploy --only hosting
```

---

## 🔒 STEP 6: SECURITY & CORS

### **6.1 Configure CORS for Backend Services**
Add to each service's `server.ts`:
```typescript
import cors from 'cors';

app.use(cors({
  origin: [
    'https://YOUR_PROJECT_ID.web.app',
    'https://YOUR_PROJECT_ID.firebaseapp.com',
    'http://localhost:3000' // For development
  ],
  credentials: true
}));
```

### **6.2 Secure Environment Variables**
```bash
# Use Google Secret Manager for sensitive keys
gcloud secrets create OPENAI_API_KEY --data-file=-
# Paste your key and press Ctrl+D

# Grant access to Cloud Run
gcloud secrets add-iam-policy-binding OPENAI_API_KEY \
  --member="serviceAccount:YOUR_SERVICE_ACCOUNT@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## 📊 STEP 7: MONITORING & LOGGING

### **7.1 Enable Cloud Logging**
```bash
# Logs are automatically sent to Cloud Logging
# View at: https://console.cloud.google.com/logs

# Query example:
resource.type="cloud_run_revision"
resource.labels.service_name="stellar-agents"
severity>="WARNING"
```

### **7.2 Set Up Alerts**
```bash
# Go to Cloud Console → Monitoring → Alerting
# Create alerts for:
# - High error rates
# - Response latency
# - Memory usage
# - CPU usage
```

---

## 💰 COST ESTIMATE

### **Free Tier Limits:**
- **Firebase Hosting:** 10GB storage, 360MB/day transfer
- **Cloud Run:** 2 million requests/month, 360K GB-seconds compute
- **Cloud Build:** 120 build-minutes/day
- **Container Registry:** 0.5GB storage

### **Expected Costs (Small Nonprofit):**
- **Firebase Hosting:** $0-5/month
- **Cloud Run (4 services):** $10-30/month
- **Supabase:** Free tier (or $25/month Pro)
- **Total:** ~$10-60/month depending on traffic

**Note:** Non-profits may qualify for Google Cloud for Nonprofits ($2,000/year credit!)

---

## 🧪 STEP 8: VERIFY DEPLOYMENT

### **8.1 Health Checks**
```bash
# Check each service
curl https://stellar-agents-xxx-uc.a.run.app/health
curl https://big-3-orchestrator-xxx-uc.a.run.app/health
curl https://browser-service-xxx-uc.a.run.app/health
curl https://chrome-devtools-mcp-xxx-uc.a.run.app/health

# All should return: {"status": "healthy"}
```

### **8.2 Test Frontend**
```bash
# Visit your Firebase URL
https://YOUR_PROJECT_ID.web.app

# Test these pages:
# /impact - Should show 4 projects
# /cockpit - Should show 6 agents
# Voice button - Should appear bottom-right
```

---

## 🔄 STEP 9: CONTINUOUS DEPLOYMENT (Optional)

### **9.1 GitHub Actions for Firebase**
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Firebase

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '22'
      - run: cd apps/web && npm install
      - run: cd apps/web && npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: YOUR_PROJECT_ID
```

### **9.2 Cloud Build for Backend**
Create `cloudbuild.yaml` in each service:
```yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/stellar-agents', '.']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/stellar-agents']
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'stellar-agents'
      - '--image'
      - 'gcr.io/$PROJECT_ID/stellar-agents'
      - '--region'
      - 'us-central1'
      - '--platform'
      - 'managed'
```

---

## 🎯 QUICK DEPLOYMENT SCRIPT

Save as `deploy-firebase.sh`:
```bash
#!/bin/bash

echo "🚀 Deploying New World Kids to Firebase + Google Cloud"

# Build frontend
echo "📦 Building frontend..."
cd apps/web
npm run build

# Deploy to Firebase
echo "🔥 Deploying to Firebase Hosting..."
firebase deploy --only hosting

# Deploy backend services
echo "☁️ Deploying backend services to Cloud Run..."

cd ../../services

# Stellar Agents
cd stellar-agents
gcloud builds submit --tag gcr.io/$PROJECT_ID/stellar-agents
gcloud run deploy stellar-agents --image gcr.io/$PROJECT_ID/stellar-agents --platform managed --region us-central1 --allow-unauthenticated
cd ..

# Big-3 Orchestrator
cd big-3-orchestrator
gcloud builds submit --tag gcr.io/$PROJECT_ID/big-3-orchestrator
gcloud run deploy big-3-orchestrator --image gcr.io/$PROJECT_ID/big-3-orchestrator --platform managed --region us-central1 --allow-unauthenticated
cd ..

# Browser Service
cd browser-service
gcloud builds submit --tag gcr.io/$PROJECT_ID/browser-service
gcloud run deploy browser-service --image gcr.io/$PROJECT_ID/browser-service --platform managed --region us-central1 --allow-unauthenticated
cd ..

# Chrome DevTools
cd chrome-devtools-mcp
gcloud builds submit --tag gcr.io/$PROJECT_ID/chrome-devtools-mcp
gcloud run deploy chrome-devtools-mcp --image gcr.io/$PROJECT_ID/chrome-devtools-mcp --platform managed --region us-central1 --allow-unauthenticated
cd ..

echo "✅ Deployment complete!"
echo "🌐 Frontend: https://$PROJECT_ID.web.app"
echo "🤖 Check service health at /health endpoints"
```

Make executable: `chmod +x deploy-firebase.sh`

---

## ✅ DEPLOYMENT COMPLETE!

**Your New World Kids platform is now live on:**
- **Frontend:** https://YOUR_PROJECT_ID.web.app
- **Backend:** Google Cloud Run (4 services)
- **Database:** Supabase Cloud

**Next Steps:**
1. Test all features
2. Monitor logs in Cloud Console
3. Set up custom domain (optional)
4. Enable SSL (automatic with Firebase)
5. Share your impact!

---

**Questions? Check the logs:**
- Firebase: `firebase serve` then check console
- Cloud Run: Cloud Console → Logging
- Supabase: Dashboard → Logs

**You're now making impact at scale! 🌍✨🚀**
