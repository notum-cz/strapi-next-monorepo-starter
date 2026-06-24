---
sidebar_position: 1
slug: /reference/deployment
---

# Deployment

This starter is deployment-provider agnostic. The repository includes GitHub Actions workflows for verification, documentation publishing, release automation, and QA runs, plus deployment notes for Heroku and Vercel.

## Deployment Surfaces

| Surface        | Purpose                                     | Docs                                                                                             |
| -------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| GitHub Actions | CI, QA, docs publishing, releases, auto PRs | [GitHub Actions](./github-actions.md)                                                            |
| Heroku         | Optional hosting target for Strapi and UI   | [Heroku](./heroku.md)                                                                            |
| Vercel         | Optional hosting target for the UI only     | [Vercel](./vercel.md)                                                                            |
| Docker         | Containerized UI and Strapi builds          | [UI Docker Build](../../ui/docker-build.md), [Strapi Docker Build](../../strapi/docker-build.md) |

## General Checklist

1. Decide where each app runs: `apps/ui`, `apps/strapi`, and optionally `apps/docs`.
2. Configure environment variables for each runtime.
3. Use managed PostgreSQL or another persistent database for Strapi.
4. Use external object storage for uploaded media in hosted environments.
5. Run CI and build checks before deploying.
6. Run the QA workflow against the deployed UI URL before promotion.
