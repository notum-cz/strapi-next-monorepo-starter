---
name: review-pr
description: >
  Use when the user wants a thorough review of a GitHub PR or a local
  feature branch's diff before merge — e.g. "review PR", "review pull
  request", "review this branch", "review the diff", "feature review",
  "/review-pr". Accepts a PR number/URL or runs against the current
  branch.
argument-hint: "[pr-number | pr-url]"
---

# Review Pull Request

Review a change before merge — run the build/test gates, dispatch focused review subagents, then produce a verdict with concrete fixes.

**Two modes, two audiences:**

| Mode      | Trigger          | Use it to                                                     | Posts back?                            |
| --------- | ---------------- | ------------------------------------------------------------- | -------------------------------------- |
| **Local** | no argument      | self-review **your own** branch before you push / open the PR | no — prints only                       |
| **PR**    | PR number or URL | review **a teammate's** (or your own) open PR                 | optional — comment / approve on GitHub |

PR mode is **GitHub-only** (it uses `gh`). On GitLab/Bitbucket/other hosts, check the branch out and use local mode — it reviews the same diff host-agnostically; only posting is skipped.

**Be thorough but terse.** Surface real issues; skip nits already handled by formatters / linters / commitlint. This skill reviews only — it never pushes fixes or merges.

## Phase 1 — Set up the review workspace

### PR mode

1. Resolve the PR number from `$ARGUMENTS`; `gh pr view <num> --json number,title,body,headRefName,baseRefName,url,state,isDraft,mergeable`.
2. Check out into an isolated worktree: if `scripts/worktree/create.sh` exists → `bash scripts/worktree/create.sh review/pr-<num> <baseRefName>` then `gh pr checkout <num>` inside it; else → `git fetch origin pull/<num>/head:review/pr-<num>` + `git worktree add ../.worktrees/review-pr-<num> review/pr-<num>`.
3. From here, all commands run in the review worktree.

### Local mode

Confirm the current branch isn't `dev` / `stage` / `main` (abort if it is) and use the current worktree as-is. Base defaults to `dev` (fall back to `main`); verify it exists.

## Phase 2 — Gather context

In parallel: `git log <base>..HEAD --oneline`, `git diff <base>...HEAD --stat`, `git diff <base>...HEAD` (full). PR mode also: `gh pr view <num> --comments` + `gh pr diff <num>` (sanity-check vs local fetch).

Map changed files to surfaces:

| Path prefix                                               | Surface                  |
| --------------------------------------------------------- | ------------------------ |
| `apps/strapi/src/api/**`, `apps/strapi/src/components/**` | Strapi schema / API      |
| `apps/ui/src/components/**`, `apps/ui/src/app/**`         | UI / Next.js             |
| `qa/tests/playwright/**`                                  | E2E tests                |
| `apps/strapi/tests/**`, `apps/ui/src/**/*.test.ts`        | Unit / integration tests |
| `package.json`, `pnpm-lock.yaml`                          | Deps                     |
| `.github/**`, `scripts/**`, `turbo.json`                  | Tooling / CI             |

## Phase 3 — Validate the build

From the review worktree, in parallel where independent (command + suite reference: `apps/docs/docs/reference/commands.md`, `apps/docs/docs/reference/testing/overview.md`):

```bash
pnpm install --frozen-lockfile --prefer-offline
pnpm typecheck
pnpm lint
pnpm test:ci
```

**Build gate (required).** If the diff touches `apps/ui/**`, `apps/strapi/**`, or any `packages/**`, the affected app(s) MUST build — typecheck doesn't catch Next.js route collection, Strapi schema compile, or bundler errors. Use `pnpm turbo build --filter=<pkg>` (not `pnpm --filter … build`) so workspace deps build in topo order.

| Diff touches                          | Command                                                        |
| ------------------------------------- | -------------------------------------------------------------- |
| only `apps/ui/**`                     | `pnpm turbo build --filter=@repo/ui`                           |
| only `apps/strapi/**`                 | `pnpm turbo build --filter=@repo/strapi`                       |
| both apps                             | both filters in parallel, **or** `pnpm build`                  |
| any `packages/**`                     | `pnpm build` — safer than guessing consumers                   |
| only `qa/**`, `.github/**`, docs only | skip build; note "build skipped — no app/package code changed" |

Never silently skip when app/package code changed. If a gate fails, capture it verbatim and **stop before Phase 4** — a broken build invalidates downstream review.

If the Strapi schema changed, run `strapi-schema-check` (skill) on the diff. If `qa/tests/playwright/**` is relevant to the change, run the matching suite (`e2e` for UI/routing, `visual` for new surfaces — never update snapshots, `axe` for a11y, `seo` for meta/head). Capture failures; don't fix them.

## Phase 4 — Dispatch parallel review subagents

Spawn these with the Agent tool in a **single message**, all independent. Each gets the diff, base + head SHA, and the changed-surface map, and reports back ≤ 200 words.

`subagent_type` lists a **preferred** specialized agent (`pr-review-toolkit` plugin) then an always-available fallback — use the fallback when the plugin isn't installed; don't fail the review over it.

| Subagent            | `subagent_type` (preferred → fallback)                          | Focus                                                      |
| ------------------- | --------------------------------------------------------------- | ---------------------------------------------------------- |
| Correctness & logic | `pr-review-toolkit:code-reviewer` → `feature-dev:code-reviewer` | bugs, off-by-one, null/undef, async errors                 |
| Silent failures     | `pr-review-toolkit:silent-failure-hunter` → `general-purpose`   | swallowed errors, fallback abuse, suppressed throws        |
| Types               | `general-purpose`                                               | TS soundness, `any` leaks, narrowing gaps                  |
| Tests               | `pr-review-toolkit:pr-test-analyzer` → `general-purpose`        | coverage of new behavior, missing edge cases               |
| Comments / docs     | `pr-review-toolkit:comment-analyzer` → `general-purpose`        | only if non-trivial new comments / docstrings              |
| Security            | `general-purpose`                                               | secrets, SSRF, SQLi, auth bypass, XSS, env-var leaks       |
| Strapi-specific     | `general-purpose`                                               | only if schema/API touched — populate, lifecycle, perms    |
| UX                  | `general-purpose`                                               | only if UI touched — a11y, loading/error states, dark mode |

When the diff touches `apps/ui/**`, the UX / types / correctness reviewers apply **`vercel-react-best-practices`** and **`next-best-practices`** as the React/Next.js rubric (and **`frontend-design`** for visual/UX surfaces) — these skills are vendored in `.agents/skills/`. They supply the standards; this skill still owns the process and verdict.

Dispatch the `Explore` agent for any read-only spelunking, so it doesn't pollute the main context.

## Phase 5 — Consolidate the report

```
# Review — <PR title or branch name>

**Verdict:** ✅ ship / ⚠️ ship with follow-ups / ❌ block

## Build & tests
- typecheck / lint / build / unit / playwright / strapi-schema: pass | fail (<n>)

## Blocking issues
1. <file:line> — <problem> — <fix>

## Non-blocking
- <file:line> — <suggestion>

## Out of scope (mention, don't block)
- <noticed but not in this PR's scope>
```

Be concrete: every issue has `file:line` + the actual fix or test that would catch it. No hand-wavy "consider refactoring".

## Phase 6 — Post (GitHub PR mode only)

Ask before posting; default is **print only**. If approved:

```bash
gh pr review <num> --comment --body-file <tmpfile>
```

`--request-changes` only for ❌; `--approve` only for ✅ and when the user explicitly says so. In local mode or on non-GitHub hosts there's nothing to post to — just print the report.

## Notes

- Never `gh pr merge` — the author/maintainer merges.
- For huge diffs (> ~2000 lines), ask the user to scope ("review which files first?") rather than dispatching blindly.
- Asana / Linear / Azure references in a PR body are out of scope — ignore them.
