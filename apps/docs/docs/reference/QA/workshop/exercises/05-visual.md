# Exercise 5 — Visual regression: local baseline, then Linux baseline

**Goal:** generate baseline screenshots for the Exercise 2 pages, inspect them, then produce the Linux-consistent versions that actually get committed.

**Needs:** Exercise 2 done. Docker Desktop for the second half.

## Step 1 — First run: create local baselines

```bash
pnpm tests:playwright:visual
```

No baseline exists for any path yet (even `/`), so every path creates one and skips comparison — expected. Look for:

```text
🟡 Baseline snapshot missing for "/auth/register" ... - creating: ...
📷 Baseline snapshot created ...
```

## Step 2 — Actually look at what got created

Open `qa/tests/playwright/visual/visual.spec.ts-snapshots/<platform>/` (`darwin/` on macOS) and inspect the new screenshots. Nothing in the pipeline does this for you — a "successfully captured" screenshot can still show a broken layout or a missing image. Catch it now, before it becomes the baseline everything compares against.

## Step 3 — Second run: confirm comparison mode

```bash
pnpm tests:playwright:visual
```

Baselines exist now, so it compares instead of creating. Nothing changed since Step 1 — should pass cleanly.

## Step 4 — Why none of this gets committed yet

`qa/tests/playwright/.gitignore` excludes `/visual/visual.spec.ts-snapshots/darwin/`. Run `git status` on the folder — your new screenshots don't even show as untracked. macOS and Linux render fonts differently, so a macOS baseline would mismatch on CI. Only Linux baselines get committed.

## Step 5 — Generate the Linux-consistent baselines

```bash
pnpm tests:playwright:visual:docker:update
```

Needs Docker Desktop running — runs Playwright in the official Linux image, producing files under `visual.spec.ts-snapshots/linux/`.

## Step 6 — Confirm what would actually get committed

```bash
git status qa/tests/playwright/visual/
```

New files under `linux/`, nothing under `darwin/`. Open one — same sanity check as Step 2, on the version that ships.

## Step 7 — Verify the Linux comparison is stable

```bash
pnpm tests:playwright:visual:docker
```

Should pass — Linux run against the Linux baseline you just made.

## Checkpoint

Explain why a macOS screenshot can't just be committed, and which commands create/update vs. compare a baseline (both Docker and host-OS forms).

Move on to [06-lighthouse.md](./06-lighthouse.md).
