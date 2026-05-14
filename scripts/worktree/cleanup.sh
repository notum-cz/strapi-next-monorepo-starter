#!/usr/bin/env sh
# Remove a worktree after verifying its branch is fully merged.
#
# Usage:
#   scripts/worktree/cleanup.sh <worktree-path-or-branch> [--base <branch>] [--force]
#
# Merge check uses `git cherry` against the base, which detects squash-merges
# (unlike `git branch --merged`, which misses them). `--force` skips the check.

set -eu

script_dir="$(cd "$(dirname "$0")" && pwd)"

force=0
base=""
arg_target=""
while [ $# -gt 0 ]; do
  case "$1" in
    --force) force=1 ;;
    --base)  shift; base="${1:-}" ;;
    -*)      echo "cleanup: unknown flag $1" >&2; exit 2 ;;
    *)
      if [ -z "${arg_target}" ]; then arg_target="$1"
      else echo "cleanup: too many positional args" >&2; exit 2
      fi
      ;;
  esac
  shift || true
done

if [ -z "${arg_target}" ]; then
  echo "usage: cleanup.sh <worktree-path-or-branch> [--base <branch>] [--force]" >&2
  exit 2
fi

canonical_root="$("${script_dir}/detect-root.sh")"

# Resolve arg_target → worktree path + branch.
target=""
branch=""
existing="$(git -C "${canonical_root}" worktree list --porcelain)"
# Try as path first.
if [ -d "${arg_target}" ]; then
  target="$(cd "${arg_target}" && pwd)"
  branch="$(git -C "${target}" rev-parse --abbrev-ref HEAD)"
else
  # Treat as branch name; find worktree that has it checked out.
  branch="${arg_target}"
  target="$(printf '%s\n' "${existing}" | awk -v b="refs/heads/${branch}" '
    /^worktree /{wt=$2}
    /^branch /{ if ($2==b) print wt }
  ' | head -n1)"
  if [ -z "${target}" ]; then
    echo "cleanup: no worktree found for branch ${branch}" >&2
    exit 1
  fi
fi

# Refuse to remove the canonical root.
if [ "${target}" = "${canonical_root}" ]; then
  echo "cleanup: refusing to remove canonical root ${canonical_root}" >&2
  exit 1
fi

# Resolve base.
if [ -z "${base}" ]; then
  if git -C "${canonical_root}" rev-parse --verify --quiet dev >/dev/null; then
    base="dev"
  elif git -C "${canonical_root}" rev-parse --verify --quiet main >/dev/null; then
    base="main"
  else
    echo "cleanup: neither dev nor main found; pass --base" >&2
    exit 1
  fi
fi

echo "cleanup: target = ${target}"
echo "cleanup: branch = ${branch}"
echo "cleanup: base   = ${base}"

if [ "${force}" -eq 0 ]; then
  # `git cherry` lists commits on branch not in base, accounting for squash equivalents
  # (lines starting with `+` are unmerged).
  unmerged="$(git -C "${canonical_root}" cherry "${base}" "${branch}" 2>/dev/null | awk '/^\+/{print}' || true)"
  if [ -n "${unmerged}" ]; then
    echo "cleanup: branch ${branch} has unmerged commits vs ${base}:" >&2
    printf '%s\n' "${unmerged}" >&2
    echo "cleanup: pass --force to remove anyway" >&2
    exit 1
  fi
fi

git -C "${canonical_root}" worktree remove ${force:+--force} "${target}"
echo "cleanup: removed worktree ${target}"

# Optionally delete the local branch if fully merged.
if [ "${force}" -eq 0 ]; then
  git -C "${canonical_root}" branch -d "${branch}" 2>/dev/null && \
    echo "cleanup: deleted branch ${branch}" || \
    echo "cleanup: branch ${branch} kept (not fully merged per git's own check; remove manually if intended)"
fi

echo "cleanup: done"
