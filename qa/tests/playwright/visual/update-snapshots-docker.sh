#!/usr/bin/env bash
# Generates Linux-compatible visual regression baseline snapshots using the official
# Playwright Docker image. Run this locally whenever UI changes require new baselines,
# then commit the generated snapshots so GitHub CI can compare against them.
#
# Usage:
#   ./update-snapshots-docker.sh                                    # all browsers (default)
#   ./update-snapshots-docker.sh visual-chromium                    # specific browser
#   ./update-snapshots-docker.sh visual-chromium visual-firefox     # multiple browsers
#   BASE_URL=https://example.com ./update-snapshots-docker.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLAYWRIGHT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
PLAYWRIGHT_VERSION="1.59.1"
if [[ $# -eq 0 ]]; then
  PROJECTS=("visual-chromium" "visual-firefox" "visual-webkit")
else
  PROJECTS=("$@")
fi

# Load BASE_URL from .env if not already set in environment
if [[ -z "${BASE_URL:-}" ]]; then
  ENV_FILE="$PLAYWRIGHT_DIR/.env"
  if [[ -f "$ENV_FILE" ]]; then
    BASE_URL="$(grep -E '^BASE_URL=' "$ENV_FILE" | head -1 | cut -d'=' -f2-)"
  fi
fi

if [[ -z "${BASE_URL:-}" ]]; then
  echo "ERROR: BASE_URL is not set. Set it via environment variable or in .env file."
  exit 1
fi

if ! docker info > /dev/null 2>&1; then
  echo "ERROR: Docker is not running. Start Docker Desktop and try again."
  exit 1
fi

PROJECT_FLAGS=()
for p in "${PROJECTS[@]}"; do
  PROJECT_FLAGS+=("--project=$p")
done

echo "Playwright: v${PLAYWRIGHT_VERSION}"
echo "BASE_URL:   $BASE_URL"
echo "Browsers:   ${PROJECTS[*]}"
echo ""

docker run --rm \
  --ipc=host \
  -v "$PLAYWRIGHT_DIR:/playwright" \
  -v "playwright_node_modules:/playwright/node_modules" \
  -w /playwright \
  -e BASE_URL="$BASE_URL" \
  -e CI=true \
  "mcr.microsoft.com/playwright:v${PLAYWRIGHT_VERSION}-noble" \
  bash -c "npm install --silent --no-package-lock && npx playwright test visual/visual.spec.ts --update-snapshots ${PROJECT_FLAGS[*]}"

echo ""
echo "Snapshots saved to:"
echo "  qa/tests/playwright/visual/visual.spec.ts-snapshots/"
echo ""
echo "Next steps:"
echo "  git add qa/tests/playwright/visual/visual.spec.ts-snapshots/"
echo "  git commit -m 'test: update Linux baseline snapshots'"
