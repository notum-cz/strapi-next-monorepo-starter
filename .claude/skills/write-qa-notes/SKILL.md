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

Capture QA tribal knowledge as an entry on the single `apps/docs/docs/reference/QA/common-knowledge/index.md` page, so Docusaurus builds it into the docs site alongside the test cases. This is for things worth not forgetting — an environment quirk, a known flaky check, a workaround, a "why does this look broken but isn't" — not test cases (`write-test-cases`) and not automated test code (`write-tests`).

## Where notes live

One page, not one file per topic: every note is a `<details>`/`<summary>` accordion entry appended to `apps/docs/docs/reference/QA/common-knowledge/index.md` — the same collapsible-FAQ pattern as [How to...](../../how-to/index.md). Don't create a new `.md` file per topic; add a new `<details>` block to the existing page instead.

The `_category_.json` in that folder already links the sidebar entry straight to `index.md` (`"link": {"type": "doc", "id": "reference/QA/common-knowledge/index"}`) — nothing else to set up, even for the first note.

## Writing a note

Keep it short — this is a note, not a report. Favor bullets over prose paragraphs; a QA engineer skimming for an answer shouldn't have to parse a paragraph to find it:

```markdown
<details>
<summary><Short, specific gotcha — phrased as what someone would search for></summary>

- **Symptom:** what you see that looks wrong.
- **Not a bug / cause:** why it happens (or that it's expected).
- **What to do:** the fix or workaround, or what to check instead.
- **Related:** link to a test case (`../test-cases/...`) or code path (`file.ts:42`) when there is one.

</details>
```

Not every note needs all four bullets — skip ones that don't apply (e.g. a pure environment fact has no "symptom"). The point is scannable bullets, not this exact label set.

- Title the `<summary>` after what someone would search for, not after when it was written.
- State the fact plainly before any backstory — a reader wants the answer first.
- Link to a related test case or code path when there is one — a note that only makes sense in isolation is easy to misapply later.
- If a note stops being true (fixed, no longer applicable), delete its `<details>` block or say so at the top of it — don't leave stale tribal knowledge for the next person to trust.
- New entries can go anywhere on the page; there's no required ordering.

No tags, no required structure beyond the accordion and its bullets — unlike `write-test-cases`, these aren't meant to be machine-parsed or automated later.
