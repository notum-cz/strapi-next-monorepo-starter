# Common Knowledge

Environment quirks, known issues, and workarounds worth not forgetting during manual QA.

<details>
<summary>Signing out in one tab doesn't refresh other open tabs</summary>

_Example note — this entry is a placeholder template for the page. Replace it with real findings as the team runs into them._

- **Symptom:** a QA account signed in across two open tabs — sign out in one, and the other tab keeps rendering the signed-in navbar.
- **Not a bug:** Better Auth's client session isn't broadcast across browser tabs, so the other tab has no way to know the session ended until it re-fetches.
- **When it clears:** on a manual refresh, or the next client-side navigation that triggers a session re-fetch.
- **What to do:** refresh the other tab before judging its state — don't file this as a defect.
- **Related:** [Logout test cases](../test-cases/logout.md)

</details>
