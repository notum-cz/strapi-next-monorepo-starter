---
sidebar_position: 21
---

# write-test-cases

Document test cases as Gherkin `.feature` files under `qa/docs/test-cases/`, mirroring the layers used by the automated Playwright suites (`e2e`, `axe`, `seo`, `visual`, `perfo`). This is QA documentation, not automated test code — for that, see `write-tests`.

## Use it when

- You want to capture test scenarios in Given/When/Then form before (or instead of) automating them.
- You want a readable spec a non-developer can review, alongside the automated suite.
- You're documenting manual QA coverage for a feature or flow.

## What it helps solve

- Separates "what should be tested" (Gherkin scenarios) from "how it's automated" (Playwright/Vitest code).
- Gives QA/product a reviewable artifact that doesn't require reading test code — steps quote the exact on-screen copy (button labels, messages) and use concrete example data, so they read naturally and double as ready-made input for whoever automates the scenario.
- Tracks which scenarios are still manual (`@manual`) vs already automated (`@automated`), with a comment linking to the spec that implements each automated one.

See also: [Testing](../../testing/overview.md), [Gherkin reference](https://cucumber.io/docs/gherkin/reference).
