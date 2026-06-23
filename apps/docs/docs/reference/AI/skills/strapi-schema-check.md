---
sidebar_position: 10
---

# strapi-schema-check

Catch risky CMS structure changes before they ship. Renaming, deleting, or changing a field can silently lose content in production. This skill flags those changes and tells you whether a safe migration is already in place.

## Use it when

- You've changed CMS fields or content structure.
- You're about to open a PR that changes existing content models.

## What it helps solve

- Warns when CMS structure changes could remove or damage existing content.
- Helps separate safe additions from risky edits.
- Gives reviewers confidence before CMS changes ship.

Run it before review whenever an existing CMS model changes.
