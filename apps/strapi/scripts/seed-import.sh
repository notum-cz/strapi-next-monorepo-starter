#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
EXPORTS_DIR="$APP_DIR/seed/exports"

if [[ ! -d "$EXPORTS_DIR" ]]; then
  echo "[seed:import] Export directory does not exist: $EXPORTS_DIR" >&2
  exit 1
fi

LATEST_EXPORT="$(find "$EXPORTS_DIR" -maxdepth 1 -type f -name 'strapi-export-*.tar.gz' | sort | tail -n 1)"

if [[ -z "$LATEST_EXPORT" ]]; then
  echo "[seed:import] No seed exports found in $EXPORTS_DIR" >&2
  exit 1
fi

echo "[seed:import] Importing $LATEST_EXPORT"
cd "$APP_DIR"
"$APP_DIR/node_modules/.bin/strapi" import --force -f "$LATEST_EXPORT"
