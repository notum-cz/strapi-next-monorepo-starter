---
name: write-qa-notes
description: >
  Use when a QA engineer wants to write down tribal knowledge so it
  isn't forgotten — e.g. "note this for QA", "remember that...",
  "add to common knowledge", "QA gotcha", "write down that...".
  Freeform notes (environment quirks, known issues, workarounds), not
  test cases (use `write-test-cases` for those) and not automated
  test code (use `write-tests`).
argument-hint: "[topic]"
---

# Write QA Notes

Capture QA tribal knowledge as a short Markdown page under `apps/docs/docs/reference/QA/common-knowledge/`, so Docusaurus builds it into the docs site alongside the test cases. This is for things worth not forgetting — an environment quirk, a known flaky check, a workaround, a "why does this look broken but isn't" — not test cases (`write-test-cases`) and not automated test code (`write-tests`).

## Where files live

One file per topic: `apps/docs/docs/reference/QA/common-knowledge/<topic>.md`, kebab-case (e.g. `staging-cdn-cache-delay.md`). Don't lump unrelated notes into one growing file — a reader looking for "why is staging slow" shouldn't have to scroll past unrelated notes to find it.

If this is the first file in the folder, `_category_.json` already exists (copied from the pattern in `test-cases/`) — nothing else to set up.

## Writing a note

Keep it short — this is a note, not a report:

```markdown
# <Short, searchable title>

<1-3 sentences: what to know, and why it matters. If there's a fix or
workaround, say what it is. If it's a known limitation, say what to
expect instead of the "correct" behavior.>
```

- Title the file after what someone would search for, not after when it was written.
- State the fact plainly before any backstory — a reader wants the answer first.
- Link to a related test case (`test-cases/...`) or code path (`file.ts:42`-style) when there is one — a note that only makes sense in isolation is easy to misapply later.
- If a note stops being true (fixed, no longer applicable), delete it or say so at the top — don't leave stale tribal knowledge for the next person to trust.

No tags, no required structure beyond the title — unlike `write-test-cases`, these aren't meant to be machine-parsed or automated later.
