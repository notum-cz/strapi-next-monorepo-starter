#!/usr/bin/env sh
# Apply `worktree.config.json` to a worktree: copy files, create symlinks, run postSetup.
#
# Usage:
#   scripts/worktree/setup.sh <worktree-path> [--force]
#
# Idempotent: already-present files are skipped unless --force is passed.

set -eu

script_dir="$(cd "$(dirname "$0")" && pwd)"
. "${script_dir}/lib/manifest.sh"

force=0
target=""
for arg in "$@"; do
  case "${arg}" in
    --force) force=1 ;;
    -*)      echo "setup: unknown flag ${arg}" >&2; exit 2 ;;
    *)
      if [ -z "${target}" ]; then target="${arg}"
      else echo "setup: too many positional args" >&2; exit 2
      fi
      ;;
  esac
done

if [ -z "${target}" ]; then
  echo "usage: setup.sh <worktree-path> [--force]" >&2
  exit 2
fi
if [ ! -d "${target}" ]; then
  echo "setup: target ${target} does not exist" >&2
  exit 1
fi

canonical_root="$("${script_dir}/detect-root.sh")"
manifest_load "${canonical_root}"

target_abs="$(cd "${target}" && pwd)"

# Copy files.
echo "${manifest_copy}" | while IFS= read -r rel; do
  [ -z "${rel}" ] && continue
  src="${canonical_root}/${rel}"
  dst="${target_abs}/${rel}"
  if [ ! -e "${src}" ]; then
    echo "setup: copy skip (source missing): ${rel}"
    continue
  fi
  if [ -e "${dst}" ] && [ "${force}" -eq 0 ]; then
    echo "setup: copy skip (already present): ${rel}"
    continue
  fi
  mkdir -p "$(dirname "${dst}")"
  cp -p "${src}" "${dst}"
  echo "setup: copied ${rel}"
done

# Symlinks.
echo "${manifest_symlink}" | while IFS= read -r rel; do
  [ -z "${rel}" ] && continue
  src="${canonical_root}/${rel}"
  dst="${target_abs}/${rel}"
  if [ ! -e "${src}" ]; then
    echo "setup: symlink skip (source missing): ${rel}"
    continue
  fi
  if [ -L "${dst}" ] || [ -e "${dst}" ]; then
    if [ "${force}" -eq 0 ]; then
      echo "setup: symlink skip (already present): ${rel}"
      continue
    fi
    rm -rf "${dst}"
  fi
  mkdir -p "$(dirname "${dst}")"
  ln -s "${src}" "${dst}"
  echo "setup: linked ${rel}"
done

# postSetup commands run sequentially inside the worktree.
echo "${manifest_postsetup}" | while IFS= read -r cmd; do
  [ -z "${cmd}" ] && continue
  echo "setup: running: ${cmd}"
  ( cd "${target_abs}" && sh -c "${cmd}" )
done

echo "setup: done"
echo "setup: NOTE: dev-server port conflicts are not auto-resolved; configure ports per-worktree if you run multiple."
