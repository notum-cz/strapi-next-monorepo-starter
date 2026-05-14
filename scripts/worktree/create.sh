#!/usr/bin/env sh
# Create a git worktree as a sibling of the canonical repo root.
#
# Usage:
#   scripts/worktree/create.sh <branch-name> [base-branch] [--force]
#
# Defaults:
#   base-branch: dev (falls back to main if dev missing)
#   target dir : <canonical-root>/../.worktrees/<branch-slug>
#
# Hard rules:
#   - never nests a worktree inside another worktree
#   - aborts if the resolved target falls under any existing worktree path
#   - calls `setup.sh` after creation to apply the manifest

set -eu

script_dir="$(cd "$(dirname "$0")" && pwd)"
. "${script_dir}/lib/manifest.sh"

force=0
branch=""
base=""
for arg in "$@"; do
  case "${arg}" in
    --force) force=1 ;;
    -*)      echo "create: unknown flag ${arg}" >&2; exit 2 ;;
    *)
      if [ -z "${branch}" ]; then branch="${arg}"
      elif [ -z "${base}" ]; then base="${arg}"
      else echo "create: too many positional args" >&2; exit 2
      fi
      ;;
  esac
done

if [ -z "${branch}" ]; then
  echo "usage: create.sh <branch-name> [base-branch] [--force]" >&2
  exit 2
fi

canonical_root="$("${script_dir}/detect-root.sh")"
echo "create: canonical root = ${canonical_root}"

# Resolve base branch.
if [ -z "${base}" ]; then
  if git -C "${canonical_root}" rev-parse --verify --quiet dev >/dev/null; then
    base="dev"
  elif git -C "${canonical_root}" rev-parse --verify --quiet main >/dev/null; then
    base="main"
  else
    echo "create: neither dev nor main found; pass base explicitly" >&2
    exit 1
  fi
fi
echo "create: base = ${base}"

# Slugify branch for directory name (replace `/` with `-`).
slug="$(printf '%s' "${branch}" | tr '/' '-')"
target="${canonical_root}/../.worktrees/${slug}"
target="$(cd "$(dirname "${target}")" 2>/dev/null && pwd)/$(basename "${target}")" || target="${target}"
echo "create: target = ${target}"

# Refuse to nest: target must not fall under any existing worktree (other than canonical root).
existing="$(git -C "${canonical_root}" worktree list --porcelain | awk '/^worktree /{print $2}')"
for wt in ${existing}; do
  case "${target}/" in
    "${wt}/"*)
      if [ "${wt}" != "${canonical_root}" ]; then
        echo "create: refusing to nest — target is inside existing worktree ${wt}" >&2
        exit 1
      fi
      ;;
  esac
done

# Idempotency: target already exists?
if [ -d "${target}" ]; then
  if [ "${force}" -eq 1 ]; then
    echo "create: --force given, removing existing target ${target}"
    git -C "${canonical_root}" worktree remove --force "${target}" 2>/dev/null || rm -rf "${target}"
  else
    echo "create: target already exists at ${target} (pass --force to recreate)"
    exit 0
  fi
fi

mkdir -p "$(dirname "${target}")"

git -C "${canonical_root}" fetch --quiet origin "${base}" 2>/dev/null || true

# Branch exists locally?
if git -C "${canonical_root}" show-ref --verify --quiet "refs/heads/${branch}"; then
  echo "create: reusing existing local branch ${branch}"
  git -C "${canonical_root}" worktree add "${target}" "${branch}"
elif git -C "${canonical_root}" show-ref --verify --quiet "refs/remotes/origin/${branch}"; then
  echo "create: tracking origin/${branch}"
  git -C "${canonical_root}" worktree add --track -b "${branch}" "${target}" "origin/${branch}"
else
  git -C "${canonical_root}" worktree add -b "${branch}" "${target}" "${base}"
fi

# Validate branch name post-creation if the project has a validator.
if [ -x "${canonical_root}/scripts/validate-branch-name.sh" ]; then
  ( cd "${target}" && "${canonical_root}/scripts/validate-branch-name.sh" ) || {
    echo "create: branch name failed project validation — worktree kept at ${target}" >&2
    exit 1
  }
fi

# Apply manifest.
"${script_dir}/setup.sh" "${target}"

echo "create: done — ${target}"
