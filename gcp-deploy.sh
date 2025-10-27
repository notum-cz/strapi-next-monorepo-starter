
#!/bin/bash
# ==============================================================================
# ONE-CLICK GOOGLE CLOUD DEPLOYMENT SCRIPT
# ==============================================================================

set -e

echo "🚀 Starting Google Cloud Deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud CLI is not installed${NC}"
    echo "Install from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Get project ID
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
if [ -z "$PROJECT_ID" ]; then
    echo -e "${YELLOW}⚠️  No GCP project set${NC}"
    echo "Set project with: gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

echo -e "${GREEN}📦 Using project: $PROJECT_ID${NC}"

# Choose deployment method
echo ""
echo "Choose deployment method:"
echo "1) Cloud Run (Recommended - Serverless, auto-scaling)"
echo "2) App Engine (Managed platform)"
echo "3) Cloud Build only (Build and push image)"
read -p "Enter choice [1-3]: " DEPLOY_CHOICE

case $DEPLOY_CHOICE in
    1)
        echo -e "${GREEN}☁️  Deploying to Cloud Run...${NC}"
        
        # Build and submit
        gcloud builds submit --config cloudbuild.yaml
        
        echo -e "${GREEN}✅ Deployment complete!${NC}"
        SERVICE_URL=$(gcloud run services describe strapi-template --region=us-west1 --format='value(status.url)')
        echo -e "${GREEN}🌐 Your app is live at: $SERVICE_URL${NC}"
        ;;
    
    2)
        echo -e "${GREEN}🏗️  Deploying to App Engine...${NC}"
        
        # Deploy to App Engine
        gcloud app deploy app.yaml --quiet
        
        echo -e "${GREEN}✅ Deployment complete!${NC}"
        gcloud app browse
        ;;
    
    3)
        echo -e "${GREEN}🔨 Building and pushing image only...${NC}"
        
        # Just build
        gcloud builds submit --config cloudbuild.yaml
        
        echo -e "${GREEN}✅ Build complete!${NC}"
        echo "Image: gcr.io/$PROJECT_ID/strapi-template:latest"
        ;;
    
    *)
        echo -e "${RED}❌ Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}🎉 All done!${NC}"
