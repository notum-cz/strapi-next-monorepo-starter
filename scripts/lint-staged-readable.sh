#!/usr/bin/env sh
set -u

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
[ -f .nvmrc ] && command -v nvm >/dev/null 2>&1 && nvm use --silent

if command -v corepack >/dev/null 2>&1; then
  corepack enable >/dev/null 2>&1
fi

output="$(mktemp)"
status=0

pnpm --silent exec lint-staged --verbose --concurrent false >"$output" 2>&1 || status=$?

if [ "$status" -ne 0 ]; then
  cat "$output"
fi

rm -f "$output"

exit "$status"
