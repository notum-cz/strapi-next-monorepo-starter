#!/usr/bin/env sh
# Resolve the canonical repo root (works from bare repo, main checkout, or any worktree).
# Prints the canonical-root absolute path on stdout.
#
# Why not `git rev-parse --show-toplevel`?
#   In a linked worktree it returns the worktree's own path, not the canonical root.
#   We need the canonical root so siblings (`../.worktrees/<branch>`) land in one place
#   regardless of where the caller invoked from.

set -eu

common_dir="$(git rev-parse --git-common-dir 2>/dev/null || true)"
if [ -z "${common_dir}" ]; then
  echo "detect-root: not inside a git repository" >&2
  exit 1
fi

# Normalize to absolute path.
case "${common_dir}" in
  /*) abs_common="${common_dir}" ;;
  *)  abs_common="$(cd "${common_dir}" && pwd)" ;;
esac

# Bare repo layouts: <root>/.bare or <root>/.git (common-dir points at .git or .bare itself)
base="$(basename "${abs_common}")"
case "${base}" in
  .git|.bare)
    canonical_root="$(dirname "${abs_common}")"
    ;;
  *)
    # Bare repo created with `git clone --bare repo.git` — common-dir is the repo dir.
    canonical_root="$(dirname "${abs_common}")"
    ;;
esac

printf '%s\n' "${canonical_root}"
