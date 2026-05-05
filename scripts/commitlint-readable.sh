#!/usr/bin/env sh
set -u

message_file="${1:-}"

if [ -z "$message_file" ]; then
  echo "Missing commit message file path."
  exit 1
fi

output="$(mktemp)"
status=0

pnpm --silent exec commitlint --edit "$message_file" >"$output" 2>&1 || status=$?

if [ "$status" -ne 0 ]; then
  input="$(sed -n 's/^.*input: //p' "$output" | head -n 1)"
  error="$(sed -n 's/^.*   //p' "$output" | grep '\[[^]]*\]' | head -n 1)"

  if [ -n "$input" ] && [ -n "$error" ]; then
    printf 'Invalid commit message: %s - %s\n\n' "$input" "$error"
  fi
fi

sed -E 's/^[^[:alnum:][:space:]]+[[:space:]]*/- /' "$output"
rm -f "$output"

exit "$status"
