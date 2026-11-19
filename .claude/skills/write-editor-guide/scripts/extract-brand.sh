#!/usr/bin/env bash
# Copies the project logo, the Notum logo and the Strapi icon SVG into <outDir> for the guide cover, header and footer.
# Usage: bash .claude/skills/write-editor-guide/scripts/extract-brand.sh <outDir> [projectLogo]
# projectLogo is saved as <outDir>/logo.<ext>. Without it, the Notum logo is used (template preview only):
# the starter's apps/ui logo is a demo mark, not a client brand.
set -euo pipefail

out="${1:?Usage: extract-brand.sh <outDir> [projectLogo]}"
logo="${2:-$(dirname "$0")/../assets/notum-logo.svg}"
mkdir -p "$out"

if [ ! -f "$logo" ]; then
  echo "Project logo not found: $logo. Pass the path as the second argument." >&2
  exit 1
fi
rm -f "$out"/logo.*
cp "$logo" "$out/logo.${logo##*.}"
cp "$(dirname "$0")/../assets/notum-logo.svg" "$out/"

# Strapi ships its logo only as a data URI inside the admin bundle.
src=$(find node_modules/.pnpm -path "*@strapi/admin/dist/admin/admin/src/assets/images/logo-strapi-2022.svg.mjs" 2>/dev/null | head -1)
if [ -z "$src" ]; then
  echo "Strapi logo not found. Run pnpm install at the repo root." >&2
  exit 1
fi

python3 -I - "$src" "$out/strapi-logo.svg" <<'EOF'
import re, sys, urllib.parse
text = open(sys.argv[1]).read()
uri = re.search(r'"(data:image/svg\+xml,[^"]+)"', text).group(1)
open(sys.argv[2], "w").write(urllib.parse.unquote(uri.split(",", 1)[1]))
EOF

ls "$out"
