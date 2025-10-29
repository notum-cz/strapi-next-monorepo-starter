#!/bin/bash

# ============================================================================
# RouteLLM Local Server Setup Script
# ============================================================================
#
# This script helps set up and run a local RouteLLM server for AI routing.
# This is OPTIONAL and NOT required for the main application to build.
#
# Requirements:
# - Python 3.9+
# - pip
# - API keys for your chosen LLM providers
#
# Usage:
#   chmod +x scripts/setup-routellm.sh
#   ./scripts/setup-routellm.sh
#
# ============================================================================

set -e

echo "================================================"
echo "RouteLLM Local Server Setup"
echo "================================================"
echo ""

# Check Python version
echo "Checking Python version..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3 is not installed"
    echo "Please install Python 3.9 or higher: https://www.python.org/downloads/"
    exit 1
fi

PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d'.' -f1)
PYTHON_MINOR=$(echo $PYTHON_VERSION | cut -d'.' -f2)

if [ "$PYTHON_MAJOR" -lt 3 ] || ([ "$PYTHON_MAJOR" -eq 3 ] && [ "$PYTHON_MINOR" -lt 9 ]); then
    echo "❌ Error: Python 3.9+ required, found $PYTHON_VERSION"
    exit 1
fi

echo "✓ Python $PYTHON_VERSION detected"
echo ""

# Check if virtual environment exists
if [ ! -d ".venv-routellm" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv .venv-routellm
    echo "✓ Virtual environment created"
else
    echo "✓ Virtual environment already exists"
fi

# Activate virtual environment
echo "Activating virtual environment..."
source .venv-routellm/bin/activate

# Install RouteLLM
echo ""
echo "Installing RouteLLM..."
echo "(This may take a few minutes)"
pip install --upgrade pip
pip install "routellm[serve,eval]"
echo "✓ RouteLLM installed"

# Check environment variables
echo ""
echo "================================================"
echo "Checking Environment Variables"
echo "================================================"
echo ""

MISSING_VARS=()

if [ -z "$OPENAI_API_KEY" ] && [ -z "$ANTHROPIC_API_KEY" ] && [ -z "$GEMINI_API_KEY" ] && [ -z "$ANYSCALE_API_KEY" ]; then
    echo "⚠️  Warning: No LLM provider API keys found"
    echo ""
    echo "At least one provider API key is required:"
    echo "  - OPENAI_API_KEY for OpenAI models (GPT-4, GPT-3.5)"
    echo "  - ANTHROPIC_API_KEY for Anthropic models (Claude)"
    echo "  - GEMINI_API_KEY for Google models (Gemini)"
    echo "  - ANYSCALE_API_KEY for Anyscale hosted models"
    echo ""
    echo "Set these in your .env.local file or export them:"
    echo "  export OPENAI_API_KEY=sk-..."
    echo ""
    MISSING_VARS+=("API_KEY")
fi

# Load environment from .env.local if it exists
if [ -f "apps/web/.env.local" ]; then
    echo "Loading environment from apps/web/.env.local"
    export $(grep -v '^#' apps/web/.env.local | xargs)
fi

# Get configuration from environment or use defaults
STRONG_MODEL="${AI_STRONG_MODEL:-gpt-4-1106-preview}"
WEAK_MODEL="${AI_WEAK_MODEL:-anyscale/mistralai/Mixtral-8x7B-Instruct-v0.1}"
ROUTER_TYPE="${AI_ROUTER_TYPE:-mf}"
PORT="${AI_ROUTER_PORT:-6060}"

echo ""
echo "================================================"
echo "Server Configuration"
echo "================================================"
echo "Strong Model: $STRONG_MODEL"
echo "Weak Model: $WEAK_MODEL"
echo "Router Type: $ROUTER_TYPE"
echo "Port: $PORT"
echo ""

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo "⚠️  Warning: Some configuration is missing"
    echo "The server may not start without proper API keys."
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 1
    fi
fi

echo "================================================"
echo "Starting RouteLLM Server"
echo "================================================"
echo ""
echo "Server will be available at: http://localhost:$PORT"
echo "Health check: http://localhost:$PORT/health"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the RouteLLM server
python -m routellm.openai_server \
    --routers "$ROUTER_TYPE" \
    --strong-model "$STRONG_MODEL" \
    --weak-model "$WEAK_MODEL" \
    --host 0.0.0.0 \
    --port "$PORT"
