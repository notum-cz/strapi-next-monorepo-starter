#!/usr/bin/env sh
# Parse `worktree.config.json` at the canonical root.
# Source this file; it defines:
#   manifest_copy        — newline-separated list of files to copy
#   manifest_symlink     — newline-separated list of paths to symlink
#   manifest_postsetup   — newline-separated commands to run inside the worktree
#
# Requires jq.

set -eu

manifest_load() {
  _root="$1"
  _file="${_root}/worktree.config.json"

  if [ ! -f "${_file}" ]; then
    echo "manifest: ${_file} not found — nothing to set up" >&2
    manifest_copy=""
    manifest_symlink=""
    manifest_postsetup=""
    return 0
  fi

  if ! command -v jq >/dev/null 2>&1; then
    echo "manifest: jq is required to parse worktree.config.json" >&2
    return 1
  fi

  manifest_copy="$(jq -r '.copy // [] | .[]' "${_file}")"
  manifest_symlink="$(jq -r '.symlink // [] | .[]' "${_file}")"
  manifest_postsetup="$(jq -r '.postSetup // [] | .[]' "${_file}")"
}
