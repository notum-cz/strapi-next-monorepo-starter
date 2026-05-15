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

Two modes — pick by `$ARGUMENTS` shape:

| Shape                                     | Mode                                                 |
| ----------------------------------------- | ---------------------------------------------------- |
| `<digits>`, `#<digits>`, or GitHub PR URL | **PR mode** — fetch + review the PR                  |
| Empty                                     | **Local mode** — review current branch diff vs `dev` |

**Be thorough but terse.** Surface real issues, skip nits already handled by formatters / linters / commitlint.

## Phase 1 — Set up the review workspace

### PR mode

1. Resolve PR number from `$ARGUMENTS`.
2. `gh pr view <num> --json number,title,body,headRefName,baseRefName,headRepository,url,state,isDraft,mergeable`.
3. Determine review checkout location:
   - If `scripts/worktree/create.sh` exists → `bash scripts/worktree/create.sh review/pr-<num> <baseRefName>` then `gh pr checkout <num>` inside it.
   - Else → `git fetch origin pull/<num>/head:review/pr-<num>` and `git worktree add ../.worktrees/review-pr-<num> review/pr-<num>`.
4. From here on, all commands run in the review worktree.

### Local mode

1. Confirm current branch is not `dev` / `main`. Abort with a clear message if it is.
2. Use the current worktree as-is. Don't create a sibling — the user already has the work checked out.
3. Base branch defaults to `dev` (fall back to `main`). Verify it exists.

## Phase 2 — Gather context

Run in parallel:

- `git log <base>..HEAD --oneline`
- `git diff <base>...HEAD --stat`
- `git diff <base>...HEAD` (full)
- For PR mode: `gh pr view <num> --comments` + `gh pr diff <num>` (sanity-check vs local fetch)

Identify changed surfaces from the file list:

| Path prefix                                               | Surface                  |
| --------------------------------------------------------- | ------------------------ |
| `apps/strapi/src/api/**`, `apps/strapi/src/components/**` | Strapi schema / API      |
| `apps/ui/src/components/**`, `apps/ui/src/app/**`         | UI / Next.js             |
| `qa/tests/playwright/**`                                  | E2E tests                |
| `apps/**/__tests__/**`, `apps/**/tests/**`                | Unit / integration tests |
| `package.json`, `pnpm-lock.yaml`                          | Deps                     |
| `.github/**`, `scripts/**`, `turbo.json`                  | Tooling / CI             |

## Phase 3 — Validate the build

Run from the review worktree, in parallel where independent:

```bash
pnpm install --frozen-lockfile --prefer-offline
pnpm typecheck
pnpm lint
pnpm test:ci
```

### Build verification (required gate)

If the diff touches `apps/ui/**`, `apps/strapi/**`, or any `packages/**`, the affected app(s) MUST build cleanly. Typecheck does not prove the app builds — Next.js route collection, Strapi schema compile, and bundler-level errors only surface during `build`.

Use **turbo's** filter (not `pnpm --filter`) so internal workspace deps are built in topo order. `turbo.json` declares `build.dependsOn: ["^build"]`, so `pnpm turbo build --filter=<pkg>` walks the dep graph; plain `pnpm --filter <pkg> build` does not.

Pick the narrowest command that covers the changed surface:

| Diff touches                          | Command                                                                      |
| ------------------------------------- | ---------------------------------------------------------------------------- |
| only `apps/ui/**`                     | `pnpm turbo build --filter=@repo/ui`                                         |
| only `apps/strapi/**`                 | `pnpm turbo build --filter=@repo/strapi`                                     |
| both apps                             | run both filters in parallel, **or** `pnpm build`                            |
| any `packages/**` (shared code)       | `pnpm build` — safer than guessing which apps consume it                     |
| only `qa/**`, `.github/**`, docs only | skip build; note "build skipped — no app/package code changed" in the report |

Never silently skip when app or package code did change. Capture build failures verbatim into the Phase 5 report and **stop before dispatching subagents** (see Notes) — a broken build invalidates downstream review.

If Strapi schema changed, also run `strapi-schema-check` (skill) on the diff.

If `qa/tests/playwright/**` exists and the diff touches UI or routing, run the relevant suite:

- UI / routing → `pnpm tests:playwright:e2e:test`
- New visual surfaces → `pnpm tests:playwright:visual` (do NOT update snapshots — flag missing baselines instead)
- Accessibility-sensitive UI → `pnpm tests:playwright:axe`
- Public meta / head changes → `pnpm tests:playwright:seo`

Capture failures verbatim. Do not fix them — surface them in the report.

## Phase 4 — Dispatch parallel review subagents

Use the Agent tool. Spawn these in a **single message**, all independent. Each gets the diff, base SHA, head SHA, and the changed-surface map.

| Subagent            | `subagent_type`                                                    | Focus                                                      |
| ------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------- |
| Correctness & logic | `feature-dev:code-reviewer` (or `pr-review-toolkit:code-reviewer`) | bugs, off-by-one, null/undef, async errors                 |
| Silent failures     | `pr-review-toolkit:silent-failure-hunter`                          | swallowed errors, fallback abuse, suppressed throws        |
| Types               | `general-purpose`                                                  | TS soundness, `any` leaks, narrowing gaps                  |
| Tests               | `pr-review-toolkit:pr-test-analyzer`                               | coverage of new behavior, missing edge cases               |
| Comments / docs     | `pr-review-toolkit:comment-analyzer`                               | only if non-trivial new comments / docstrings              |
| Security            | `claude` (or `general-purpose`)                                    | secrets, SSRF, SQLi, auth bypass, XSS, env-var leaks       |
| Strapi-specific     | `general-purpose`                                                  | only if schema/API touched — populate, lifecycle, perms    |
| UX                  | `general-purpose`                                                  | only if UI touched — a11y, loading/error states, dark mode |

Each subagent receives a focused prompt and reports back ≤ 200 words. Use `context: fork` with the Explore agent for any spelunking the reviewer needs (don't pollute the main context).

## Phase 5 — Consolidate the report

Format:

```
# Review — <PR title or branch name>

**Verdict:** ✅ ship / ⚠️ ship with follow-ups / ❌ block

## Build & tests
- typecheck: pass | fail (<n> errors)
- lint: pass | fail
- build: pass | fail
- unit: pass | fail (<n> failed)
- playwright: <suites run>: pass | fail
- strapi-schema: safe | risky (see notes)

## Blocking issues
1. <file:line> — <one-line problem> — <one-line fix>
2. ...

## Non-blocking
- <file:line> — <suggestion>

## Out of scope (mention, don't block)
- <thing the reviewer noticed but isn't in this PR's scope>
```

Be concrete. Every issue has `file:line` + the actual fix or test that would catch it. No hand-wavy "consider refactoring".

## Phase 6 — Post (PR mode only)

Ask the user before posting. Default: **don't post**, print only.

If approved:

```bash
gh pr review <num> --comment --body-file <tmpfile>
```

Use `--request-changes` only when verdict is ❌. Use `--approve` only when verdict is ✅ and the user explicitly says so.

## Notes

- Never push to the PR branch. Reviewers don't push fixes.
- Never `gh pr merge`. The author or maintainer merges.
- If the build/test gates fail, **stop after Phase 3** and report. No point dispatching subagents against a broken branch.
- Asana / Linear / Azure: out of scope v1. Ignore non-GitHub references in the PR body.
- For huge diffs (> ~2000 lines changed), ask the user to scope: "review which files first?" rather than blindly dispatching.
