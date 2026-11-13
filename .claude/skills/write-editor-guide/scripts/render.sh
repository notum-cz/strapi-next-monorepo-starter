#!/usr/bin/env bash
# Renders the guide HTML to the final PDF: margin-less cover + body with header/footer, merged.
# Usage: bash .claude/skills/write-editor-guide/scripts/render.sh <guide.html> <out.pdf>
set -euo pipefail

html="${1:?Usage: render.sh <guide.html> <out.pdf>}"
out="${2:?Usage: render.sh <guide.html> <out.pdf>}"
work="$(cd "$(dirname "$html")" && pwd)"
here="$(dirname "$0")"

# pypdf is not part of the repo, so it lives next to the scratch HTML.
if [ ! -d "$work/py/pypdf" ]; then
  python3 -m pip install -q --target "$work/py" pypdf
fi

node "$here/render.cjs" "$html" "$work/cover.pdf" "$work/body.pdf"

PYTHONPATH="$work/py" python3 - "$work/cover.pdf" "$work/body.pdf" "$out" <<'EOF'
import sys
from pypdf import PdfWriter
writer = PdfWriter()
for part in sys.argv[1:3]:
    writer.append(part)
writer.write(sys.argv[3])
print(f"{len(writer.pages)} pages -> {sys.argv[3]}")
EOF
