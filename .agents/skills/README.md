# Agent skills

Skills are reusable agent instructions for tasks in this repo. Claude Code, generic AGENTS.md consumers, and any tool following the [agentskills.io](https://agentskills.io) standard read this directory.

## Layout

```
.agents/skills/<skill-name>/
  SKILL.md         # required, the hub
  workflow.md      # optional, detail file when SKILL.md grows past ~200 lines
  examples.md      # optional, concrete examples
  scripts/         # optional, scripts bundled with the skill
  agents/          # optional, per-runtime config (e.g. openai.yaml)
```

`.claude/skills` is a committed symlink pointing here so Claude Code auto-discovers skills without duplicate files.

## SKILL.md format

Minimal frontmatter plus a rich `description`:

```yaml
---
name: make-pr
description: >
  Create GitHub pull requests with clear, reviewer-friendly descriptions.
  Use when asked to open or prepare a PR. Triggers on keywords: "open PR",
  "create pull request", "prepare PR". References .github/pull_request_template.md.
---
```

Body holds the prompt. Keep it lean. Move long detail into `workflow.md` and reference it from `SKILL.md`.

### Required frontmatter

| Field         | Purpose                                                       |
| ------------- | ------------------------------------------------------------- |
| `name`        | Skill identifier, kebab-case, matches dir name                |
| `description` | When to trigger. Include keywords, refs, scope. Rich is fine. |

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

Use `$skill-name` syntax to reference another skill in prose (next.js convention).

## Writing a new skill

1. Pick a task-named, action-first name: `add-content-type`, `make-pr`, `review-pr`.
2. Decide if the skill has side effects → set `disable-model-invocation: true` if so.
3. Write `description` so an agent can decide _when_ to trigger from prompt context. Include trigger keywords and scope.
4. Keep `SKILL.md` body lean. Detail goes in `workflow.md`.
5. Bundle scripts inside the skill dir under `scripts/`. Refer to them with relative paths.
6. Skill prose stays portable: no starter-only paths hardcoded in the description. Reference paths inside the body where the agent needs them.

## Skills catalog

Currently shipped:

| Skill                      | Type           | Purpose                                                                |
| -------------------------- | -------------- | ---------------------------------------------------------------------- |
| `make-pr`                  | stack-agnostic | Create a GitHub PR from the current branch with a templated body.      |
| `fix-issue`                | stack-agnostic | Start work on an issue: create worktree + branch, draft initial plan.  |
| `review-pr`                | stack-agnostic | Review a PR (or local branch vs `dev`) with parallel review subagents. |
| `write-tests`              | stack-agnostic | Generate or extend Vitest / Playwright tests for a target.             |
| `add-content-type`         | stack-coupled  | Scaffold a Strapi v5 collection or single type + reminders.            |
| `add-ui-component`         | stack-coupled  | Add a Next.js / shadcn UI component under `apps/ui/src/components/`.   |
| `add-locale`               | stack-coupled  | Wire a new locale into Strapi i18n + Next.js routing.                  |
| `create-content-component` | stack-coupled  | Build a Strapi component used by the page builder + Next.js render.    |
| `strapi-schema-check`      | stack-coupled  | Validate Strapi schema diffs (auto-loaded on `schema.json` edits).     |

## Stack-coupled vs stack-agnostic

| Type           | Examples                                                                                                |
| -------------- | ------------------------------------------------------------------------------------------------------- |
| Stack-agnostic | `make-pr`, `review-pr`, `fix-issue`, `write-tests`                                                      |
| Stack-coupled  | `add-content-type`, `add-ui-component`, `strapi-schema-check`, `add-locale`, `create-content-component` |

Stack-agnostic skills may move to a shared plugin later; stack-coupled stay in the starter.

## References

- Claude Code skills docs: https://code.claude.com/docs/en/skills
- agentskills.io standard: https://agentskills.io
- Pattern reference (next.js): https://github.com/vercel/next.js/tree/canary/.agents/skills
- Pattern reference (remix): https://github.com/remix-run/remix/tree/main/.agents/skills
