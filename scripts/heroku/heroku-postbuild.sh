#!/usr/bin/env bash
set -euo pipefail

if [ "${TURBO_SCOPE:-}" = "@repo/ui" ]; then
  yarn workspace @repo/ui build
elif [ "${TURBO_SCOPE:-}" = "@repo/strapi" ]; then
  yarn workspace @repo/strapi build
else
  echo "Invalid TURBO_SCOPE env value. Please set TURBO_SCOPE to one of: @repo/ui, @repo/strapi"
  exit 1
fi

rm -rf .turbo node_modules/.cache