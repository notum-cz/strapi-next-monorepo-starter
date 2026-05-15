#!/usr/bin/env bash
# Runs visual regression comparison inside a Linux Docker container against
# the committed baseline snapshots. Use this to verify locally before pushing.
#
# Usage:
#   ./compare-snapshots-docker.sh                                    # all browsers (default)
#   ./compare-snapshots-docker.sh visual-chromium                    # specific browser
#   ./compare-snapshots-docker.sh visual-chromium visual-firefox     # multiple browsers
#   BASE_URL=https://example.com ./compare-snapshots-docker.sh

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLAYWRIGHT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
PLAYWRIGHT_VERSION="1.59.1"
if [[ $# -eq 0 ]]; then
  PROJECTS=("visual-chromium" "visual-firefox" "visual-webkit")
else
  PROJECTS=("$@")
fi

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
  bash -c "npm install --silent --no-package-lock && npx playwright test visual/visual.spec.ts ${PROJECT_FLAGS[*]}"
EXIT_CODE=$?

if [[ $EXIT_CODE -ne 0 ]]; then
  echo ""
  echo "Tests failed — opening Playwright report..."
  cd "$PLAYWRIGHT_DIR" && pnpm exec playwright show-report
fi

exit $EXIT_CODE
