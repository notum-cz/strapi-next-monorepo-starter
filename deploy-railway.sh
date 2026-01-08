#!/bin/bash

# Railway Deployment Script for New World Kids
# Usage: ./deploy-railway.sh

set -e

echo "🚀 Railway Deployment Script"
echo "=============================="
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
    echo "✅ Railway CLI installed"
fi

# Login check
echo "🔐 Checking Railway authentication..."
if ! railway whoami &> /dev/null; then
    echo "Please login to Railway:"
    railway login
fi

echo "✅ Authenticated with Railway"
echo ""

# Link project
echo "🔗 Linking to Railway project..."
if [ ! -f ".railway/config.json" ]; then
    echo "No existing Railway project found. Please link manually:"
    echo "  railway link"
    exit 1
fi

echo "✅ Project linked"
echo ""

# Show current environment
echo "📊 Current Railway environment:"
railway status
echo ""

# Build and deploy
echo "🏗️  Building and deploying..."
railway up

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Your app is deploying. Check status at:"
echo "   https://railway.app/dashboard"
echo ""
echo "📝 View logs:"
echo "   railway logs"
echo ""
echo "🔧 Environment variables:"
echo "   railway variables"
