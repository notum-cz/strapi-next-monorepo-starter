#!/bin/bash

# Stellar Agentic Cockpit - One-Command Deployment Script
# Usage: ./deploy.sh [local|railway|render]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Banner
echo -e "${CYAN}"
echo "╔════════════════════════════════════════════════╗"
echo "║   Stellar Agentic Cockpit - Deployment        ║"
echo "╚════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check deployment target
TARGET=${1:-local}
echo -e "${BLUE}Deployment Target: ${TARGET}${NC}\n"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to run migration
run_migrations() {
    echo -e "${BLUE}Applying database migrations...${NC}"

    if ! command_exists supabase; then
        echo -e "${YELLOW}Supabase CLI not found. Install: npm install -g supabase${NC}"
        echo -e "${YELLOW}Skipping migrations. Apply manually:${NC}"
        echo "  1. supabase/migrations/20250120_initial_schema.sql"
        echo "  2. supabase/migrations/20250120_impact_tracking.sql"
        return
    fi

    # Check if linked to project
    if [ ! -f ".supabase/config.toml" ]; then
        echo -e "${YELLOW}Not linked to Supabase project.${NC}"
        echo "Run: supabase link --project-ref sbbuxnyvflczfzvsglpe"
        return
    fi

    supabase db push
    echo -e "${GREEN}✓ Migrations applied${NC}\n"
}

# Function to build services
build_services() {
    echo -e "${BLUE}Building backend services...${NC}"

    if ! command_exists yarn; then
        echo -e "${RED}Yarn not found. Please install Yarn first.${NC}"
        exit 1
    fi

    # Install dependencies
    echo "Installing dependencies..."
    yarn install

    # Build each service
    for service in stellar-agents big-3-orchestrator browser-service chrome-devtools-mcp; do
        if [ -d "services/$service" ]; then
            echo "Building $service..."
            cd "services/$service"
            yarn build
            cd ../..
            echo -e "${GREEN}✓ $service built${NC}"
        fi
    done

    echo ""
}

# Local deployment
deploy_local() {
    echo -e "${CYAN}Starting local deployment with Docker Compose...${NC}\n"

    if ! command_exists docker; then
        echo -e "${RED}Docker not found. Please install Docker first.${NC}"
        exit 1
    fi

    # Check for .env file
    if [ ! -f ".env.local" ] && [ ! -f ".env" ]; then
        echo -e "${YELLOW}No .env file found. Creating from .env.example...${NC}"
        if [ -f ".env.example" ]; then
            cp .env.example .env.local
            echo -e "${YELLOW}Please update .env.local with your API keys${NC}"
            echo -e "${YELLOW}Required: OPENAI_API_KEY, ANTHROPIC_API_KEY, GOOGLE_API_KEY${NC}\n"
        fi
    fi

    # Build and start services
    echo "Building Docker images..."
    docker-compose build

    echo -e "\n${GREEN}Starting services...${NC}"
    docker-compose up -d

    echo -e "\n${GREEN}✓ Services started!${NC}\n"
    echo "Services running at:"
    echo "  • Stellar Agents:       http://localhost:3004"
    echo "  • Big-3 Orchestrator:   http://localhost:3010"
    echo "  • Browser Service:      http://localhost:3013"
    echo "  • Chrome DevTools MCP:  http://localhost:3014"
    echo ""
    echo "View logs: docker-compose logs -f"
    echo "Stop services: docker-compose down"
    echo ""

    # Verify deployment
    echo -e "${BLUE}Verifying deployment...${NC}"
    sleep 5
    node verify-deployment.js local
}

# Railway deployment
deploy_railway() {
    echo -e "${CYAN}Deploying to Railway...${NC}\n"

    if ! command_exists railway; then
        echo -e "${YELLOW}Railway CLI not found. Installing...${NC}"
        npm install -g @railway/cli
    fi

    # Login check
    echo "Checking Railway authentication..."
    if ! railway whoami >/dev/null 2>&1; then
        echo "Please login to Railway:"
        railway login
    fi

    echo -e "${GREEN}✓ Authenticated${NC}\n"

    # Deploy each service
    for service in stellar-agents big-3-orchestrator browser-service chrome-devtools-mcp; do
        if [ -d "services/$service" ]; then
            echo -e "${BLUE}Deploying $service to Railway...${NC}"
            cd "services/$service"

            # Initialize Railway project if needed
            if [ ! -f "railway.toml" ]; then
                railway init
            fi

            # Deploy
            railway up

            cd ../..
            echo -e "${GREEN}✓ $service deployed${NC}\n"
        fi
    done

    echo -e "${GREEN}✓ All services deployed to Railway!${NC}\n"
    echo "Get service URLs with: railway status"
    echo ""
    echo -e "${YELLOW}Don't forget to:${NC}"
    echo "1. Set environment variables for each service in Railway dashboard"
    echo "2. Update Vercel env vars with Railway URLs"
    echo "3. Run: node verify-deployment.js production"
}

# Render deployment
deploy_render() {
    echo -e "${CYAN}Deploying to Render...${NC}\n"
    echo -e "${YELLOW}Render deployment requires manual setup via dashboard.${NC}\n"

    echo "Steps:"
    echo "1. Go to: https://dashboard.render.com"
    echo "2. Create 4 new Web Services:"
    echo "   - stellar-agents (services/stellar-agents)"
    echo "   - big-3-orchestrator (services/big-3-orchestrator)"
    echo "   - browser-service (services/browser-service)"
    echo "   - chrome-devtools-mcp (services/chrome-devtools-mcp)"
    echo "3. Set environment variables for each"
    echo "4. Deploy"
    echo ""
    echo "See PRODUCTION_DEPLOYMENT.md for detailed instructions"
}

# Main deployment flow
main() {
    # Run migrations (if possible)
    run_migrations

    # Deploy based on target
    case $TARGET in
        local)
            deploy_local
            ;;
        railway)
            build_services
            deploy_railway
            ;;
        render)
            echo -e "${BLUE}Preparing for Render deployment...${NC}\n"
            build_services
            deploy_render
            ;;
        *)
            echo -e "${RED}Unknown deployment target: $TARGET${NC}"
            echo "Usage: ./deploy.sh [local|railway|render]"
            exit 1
            ;;
    esac

    echo -e "\n${GREEN}════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}Deployment complete!${NC}"
    echo -e "${GREEN}════════════════════════════════════════════════${NC}\n"
}

# Run main
main
