# Agent skills

Skills are reusable agent instructions for tasks in this repo. Claude Code auto-discovers them from this directory.

## Where skills live (one folder, two paths)

`.claude/skills/` is the **single source of truth** — every skill (repo-authored and vendored) is a real directory here, auto-discovered by Claude Code. A committed symlink at `.agents/skills/` (`.agents/skills -> ../.claude/skills`) exposes the same set to any agent following the [agentskills.io](https://agentskills.io) standard — Codex, Copilot CLI, Gemini — which discover skills from `.agents/skills/` directly. Both paths resolve to the same files.

- **Repo-authored skills** — hand-written here (`make-pr`, `create-content-component`, …).
- **Vendored skills** — community skills installed with `skills.sh` (`npx skills add …`), tracked in `skills-lock.json` at the repo root (`find-skills`, `frontend-design`, `next-best-practices`, `vercel-react-best-practices`). `npx skills add/update` writes through the `.agents/skills` symlink into this folder; the lockfile records each one's source + content hash. Keep their `LICENSE`/`metadata.json` files.

> **Windows note:** the `.agents/skills` symlink needs `git config core.symlinks true` (and Developer Mode) once per clone to materialize. Claude Code is unaffected — it reads the real `.claude/skills` — but agentskills.io-standard agents miss the directory until the symlink resolves.

## Layout

```
.claude/skills/<skill-name>/
  SKILL.md         # required, the hub
  workflow.md      # optional, detail file when SKILL.md grows past ~200 lines
  examples.md      # optional, copy-paste material
  scripts/         # optional, scripts bundled with the skill
```

## SKILL.md format

Minimal frontmatter plus a `description` that leads with **when** to trigger:

```yaml
---
name: make-pr
description: >
  Use when the user asks to open or prepare a GitHub PR — e.g. "open PR",
  "create pull request", "prepare PR". References
  .github/pull_request_template.md.
---
```

Body holds the prompt. Keep it lean. Move long detail into `workflow.md` and reference it from `SKILL.md`.

### Required frontmatter

| Field         | Purpose                                                                                                                                    |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `name`        | Skill identifier, kebab-case, matches dir name                                                                                             |
| `description` | When to trigger. Lead with "Use when…"; list symptoms + keywords. Do **not** summarize the workflow — Claude will skip the body if you do. |

### Optional frontmatter (Claude-specific, ignored by other tools)

| Field                      | Purpose                                              |
| -------------------------- | ---------------------------------------------------- |
| `argument-hint`            | Hint shown when skill takes an argument              |
| `disable-model-invocation` | `true` for skills with side effects (e.g. `make-pr`) |
| `user-invocable`           | Restrict to slash-command invocation only            |
| `allowed-tools`            | Restrict tool set the skill may call                 |
| `model`, `effort`          | Override model / reasoning effort for the skill      |
| `context: fork`            | Run in a forked context (used for parallel review)   |
| `paths`                    | Glob list to auto-load skill on relevant file edits  |
| `hooks`                    | Skill-scoped hooks                                   |
| `arguments`                | Declared arg shape                                   |

## Cross-skill references

Reference other skills by bare name in prose (e.g. ``use `create-content-component` for those``). Match the in-file convention; no special syntax.

## Bundled scripts

Bundled scripts assume **the repo root is the current working directory** when invoked (e.g. `bash .claude/skills/strapi-schema-check/scripts/check.sh`). Skill prose calls them with that absolute-from-root path. If a skill moves to a shared plugin later, this assumption needs revisiting — until then, repo-root is the contract.

## Writing a new skill

1. Pick a task-named, action-first name: `add-content-type`, `make-pr`, `review-pr`.
2. Decide if the skill has side effects → set `disable-model-invocation: true` if so.
3. Write `description` so an agent can decide _when_ to trigger from prompt context. Lead with "Use when…", list concrete symptoms and trigger keywords. Avoid recapping the workflow.
4. Keep `SKILL.md` body lean. Detail goes in `workflow.md`; copy-paste material in `examples.md`.
5. Bundle scripts inside the skill dir under `scripts/`. Refer to them from skill prose using the repo-root-relative path.
6. Skill prose stays portable: no starter-only paths in the `description`. Reference paths inside the body where the agent needs them.

## Skills catalog

Currently shipped:

| Skill                         | Type            | Purpose                                                                  |
| ----------------------------- | --------------- | ------------------------------------------------------------------------ |
| `start-work`                  | stack-agnostic  | Start work on an issue: create worktree + branch, draft initial plan.    |
| `make-pr`                     | stack-agnostic  | Create a GitHub PR from the current branch with a templated body.        |
| `review-pr`                   | stack-agnostic  | Review a PR (or local branch vs `dev`) with parallel review subagents.   |
| `resolve-review-suggestions`  | stack-agnostic  | Use authenticated `gh` to implement unresolved GitHub PR review threads. |
| `validate-branch-refs`        | stack-agnostic  | Validate and update stale references/claims in docs, comments, config.   |
| `write-tests`                 | stack-agnostic  | Generate or extend Vitest / Playwright tests for a target.               |
| `add-content-type`            | stack-coupled   | Scaffold a Strapi v5 collection or single type + reminders.              |
| `add-ui-component`            | stack-coupled   | Add a Next.js / shadcn UI component under `apps/ui/src/components/`.     |
| `add-locale`                  | stack-coupled   | Wire a new locale into Strapi i18n + Next.js routing.                    |
| `create-content-component`    | stack-coupled   | Build a Strapi component used by the page builder + Next.js render.      |
| `copy-component`              | stack-coupled   | Replicate a section from a description, screenshot, or code snippet.     |
| `find-component`              | stack-coupled   | Find an existing page-builder component by description or screenshot.    |
| `consolidate-patterns`        | stack-coupled   | Extract repeated JSX from page-builder components into elementary ones.  |
| `seed-content`                | stack-coupled   | Seed pages / navbar / footer into local Strapi via the MCP server.       |
| `strapi-schema-check`         | stack-coupled   | Validate Strapi schema diffs (auto-loaded on `schema.json` edits).       |
| `remove-sentry`               | stack-coupled   | Remove Sentry from the UI and Strapi while keeping structured logging.   |
| `remove-azure-monitor`        | stack-coupled   | Remove the Azure Monitor telemetry exporter, keeping logging intact.     |
| `remove-cache-revalidation`   | stack-coupled   | Uninstall the Next.js cache revalidation feature (and CDN purge).        |
| `remove-cdn-purge`            | stack-coupled   | Uninstall the optional CDN purge integration only.                       |
| `find-skills`                 | helper/vendored | Discover and install additional agent skills via the Skills CLI.         |
| `frontend-design`             | helper/vendored | Apply distinctive visual design guidance for frontend work.              |
| `next-best-practices`         | helper/vendored | Apply Next.js App Router, RSC, data, metadata, and bundling guidance.    |
| `vercel-react-best-practices` | helper/vendored | Apply Vercel React and Next.js performance rules.                        |

## Stack-coupled vs stack-agnostic

| Type            | Examples                                                                                                                                                                                                                                                                      |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Stack-agnostic  | `start-work`, `make-pr`, `review-pr`, `resolve-review-suggestions`, `validate-branch-refs`, `write-tests`                                                                                                                                                                     |
| Stack-coupled   | `add-content-type`, `add-ui-component`, `strapi-schema-check`, `add-locale`, `create-content-component`, `copy-component`, `find-component`, `consolidate-patterns`, `seed-content`, `remove-sentry`, `remove-azure-monitor`, `remove-cache-revalidation`, `remove-cdn-purge` |
| Helper/vendored | `find-skills`, `frontend-design`, `next-best-practices`, `vercel-react-best-practices`                                                                                                                                                                                        |

Stack-agnostic skills may move to a shared plugin later; stack-coupled stay in the starter.
Helper/vendored skills are installed into the same directory but usually act as supporting rubrics or ecosystem tools rather than starter-specific implementation workflows.

## References

- Claude Code skills docs: https://code.claude.com/docs/en/skills
- agentskills.io standard: https://agentskills.io
- Pattern reference (next.js): https://github.com/vercel/next.js/tree/canary/.agents/skills
