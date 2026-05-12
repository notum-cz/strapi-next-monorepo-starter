#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
EXPORTS_DIR="$APP_DIR/seed/exports"
KEEP_COUNT=5

mkdir -p "$EXPORTS_DIR"

TIMESTAMP="$(date '+%Y-%m-%d-%H%M%S')"
EXPORT_BASE="$EXPORTS_DIR/strapi-export-$TIMESTAMP"

echo "[seed:export] Exporting to $EXPORT_BASE.tar.gz"
cd "$APP_DIR"
"$APP_DIR/node_modules/.bin/strapi" export --file "$EXPORT_BASE" --no-encrypt

ARCHIVES=()
while IFS= read -r ARCHIVE; do
  ARCHIVES+=("$ARCHIVE")
done < <(find "$EXPORTS_DIR" -maxdepth 1 -type f -name 'strapi-export-*.tar.gz' | sort -r)

for ((INDEX = KEEP_COUNT; INDEX < ${#ARCHIVES[@]}; INDEX++)); do
  echo "[seed:export] Removing old export ${ARCHIVES[$INDEX]}"
  rm -f "${ARCHIVES[$INDEX]}"
done
