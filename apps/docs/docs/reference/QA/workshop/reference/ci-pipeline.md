# Deep dive: GitHub Actions QA pipeline

Presenting material — Exercise 6 (and the stretch goal in Exercise 7).

## Trigger — manual only

```yaml
on:
  # schedule:
  #   - cron: "0 0 * * 1-5"
  workflow_dispatch:
    inputs:
      run_e2e: { type: boolean, default: false }
      run_axe: { type: boolean, default: false }
      run_seo: { type: boolean, default: false }
      run_lhci_perfo: { type: boolean, default: false }
      run_visual: { type: boolean, default: false }
      base_url: { type: string, required: false, default: "" }
```

- Only `workflow_dispatch` is active — nothing runs on its own until someone (or a cron) starts it
- Every suite defaults to `false` — an empty checkbox set runs the shell, not a job
- Empty `base_url` → falls back to the repo/environment variable `BASE_URL` (Settings → Actions → Variables)
- `run-name` is built from the checked inputs (`[E2E, AXE] QA – https://staging...`) — a scannable run list

## Job structure

- 5 jobs: `e2e`, `axe`, `seo`, `visual`, `lhci_perfo`
- Each gated by `if: ${{ inputs.run_X }}`, no `needs:` between them → run in parallel
- Unchecked = _skipped_, not failed
- Shared steps: checkout → setup-pnpm → cache/install Playwright → the same `pnpm tests:playwright:...` command as locally (Exercises 3, 4, 5, 7) → upload report on failure

## Concurrency

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.head_ref || github.run_id }}
  cancel-in-progress: true
```

- **On a PR:** push new code → the CI run already going for that PR gets killed, the new one takes over. No point finishing a check on code you just replaced.
- **Manual runs:** always independent. Click "Run workflow" twice → both run to the end, neither one cancels the other.

## Artifacts on failure

| Job          | Uploads                                  | Note                                                  |
| ------------ | ---------------------------------------- | ----------------------------------------------------- |
| `e2e`        | `playwright-report`, `playwright-traces` | trace = `trace.zip`, open via `playwright show-trace` |
| `axe`        | `axe-report`                             | tarball                                               |
| `seo`        | `seo-report`                             | tarball                                               |
| `visual`     | `visual-report`                          | only if a comparison actually ran                     |
| `lhci_perfo` | `perfo-report`                           | `if: always()` — even on a green run                  |

- `retention-days: 7`, `if-no-files-found: warn` — nothing to upload ≠ failure

## The visual job's extra step

- First looks for committed `*.png` under `visual.spec.ts-snapshots`
- Found nothing → skip the run ("no baseline yet" ≠ failure)
- Found some → cache/pull a pinned Playwright Docker image (version must match `package.json`) → `tests:playwright:visual:docker`

## Running it on demand

1. Actions → **QA** → **Run workflow**
2. Pick the branch — determines the version of `qa.yml` and the test code
3. Check the suites, fill in `base_url`
4. Run, watch in parallel, artifacts from the run summary

## Cron schedule (commented out)

```yaml
# schedule:
#   - cron: "0 0 * * 1-5"
```

- 00:00 UTC on weekdays
- **Uncommenting alone isn't enough** — `if: inputs.run_X` is always false outside `workflow_dispatch`
- Each job additionally needs: `if: ${{ inputs.run_e2e || github.event_name == 'schedule' }}`
- `run-name` already handles "SCHEDULED" on its own

**Decide before enabling:**

- Which suites run nightly (not the whole Visual+Lighthouse combo — slowest)
- `vars.BASE_URL` must point at something stable (no one types it in by hand)
- How a failure gets noticed (the default email is easy to miss → Slack/Teams)
- Multiple `cron:` entries are fine (nightly smoke + weekly full run)
- Cron always targets the default branch, never a PR branch

## Quick recap

| Trigger                      | Started by               | Runs against                    | Needs                                |
| ---------------------------- | ------------------------ | ------------------------------- | ------------------------------------ |
| Manual (`workflow_dispatch`) | Anyone with write access | Chosen branch + `base_url`      | Works today                          |
| Cron                         | GitHub, unattended       | Default branch, `vars.BASE_URL` | Uncomment + update `if:` in each job |
