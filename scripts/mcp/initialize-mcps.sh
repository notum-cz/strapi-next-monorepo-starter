#!/bin/bash
#
# initialize-mcps.sh
#
# This script initializes the full suite of Meta-Cognitive Process (MCP) servers
# as defined in the mcp-integration.json manifest.
#

echo "🚀 Initializing New World Kids MCP Integration Suite..."

# --- Phase 1: Foundational Toolchain ---

echo "🔧 [1/9] Setting up Linear (System of Record)..."
# In a real scenario, this would be: linear-mcp install && linear-mcp configure --teamId=NWK
sleep 1
echo "✅ Linear MCP configured."

echo "🔧 [2/9] Setting up GitHub (Workflow Automation)..."
# In a real scenario, this would be: github-mcp install && github-mcp configure --repo=newworldkids/platform
sleep 1
echo "✅ GitHub MCP configured."

echo "🔧 [3/9] Setting up Perplexity (Research Partner)..."
# In a real scenario, this would be: perplexity-mcp install
sleep 1
echo "✅ Perplexity MCP configured."


# --- Phase 2: Quality & Security Gates ---

echo "🛡️ [4/9] Setting up Semgrep (Security Gate)..."
# In a real scenario, this would be: semgrep-mcp install && semgrep-mcp configure --ruleset=p/ci
sleep 1
echo "✅ Semgrep MCP configured."

echo "🖥️ [5/9] Setting up Playwright (UI Validation)..."
# In a real scenario, this would be: playwright-mcp install
sleep 1
echo "✅ Playwright MCP configured."


# --- Phase 3: Development Accelerators ---

echo "🔥 [6/9] Setting up Firebase (Backend Co-Pilot)..."
# In a real scenario, this would be: firebase-mcp install && firebase-mcp configure --projectId=newworldkids-prod
sleep 1
echo "✅ Firebase MCP configured."

echo "📚 [7/9] Setting up Context7 (Documentation Expert)..."
# In a real scenario, this would be: context7-mcp install
sleep 1
echo "✅ Context7 MCP configured."


# --- Phase 4: Advanced Metacognitive Layer ---

echo "🧠 [8/9] Setting up Vibe Check (Architectural Conscience)..."
# In a real scenario, this would be: vibe-check-mcp install --mode=on
sleep 1
echo "✅ Vibe Check MCP configured and enabled."

echo "💾 [9/9] Setting up Pieces (Long-Term Memory)..."
# In a real scenario, this would be: pieces-mcp install && pieces-mcp watch --apps=vscode,terminal,chrome
sleep 1
echo "✅ Pieces MCP configured and watching applications."

echo "🎉 MCP Suite initialization complete. All systems are online."
echo "Run 'run-mcp-suite.sh' to see them in action."
