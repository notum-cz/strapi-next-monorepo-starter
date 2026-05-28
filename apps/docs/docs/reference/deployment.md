# Deployment

This starter includes GitHub Actions workflows and Heroku deployment helpers. Treat this page as a starting point and adapt the runtime details to your own hosting target.

## GitHub Actions

Prepared workflows:

1. [`ci.yml`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/.github/workflows/ci.yml) runs on push and pull requests to `main` and verifies that code builds.
2. [`qa.yml`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/.github/workflows/qa.yml) is manually triggered and runs the QA tests from `qa/tests`. It should usually target a deployed UI by setting `BASE_URL`.
3. [`auto-pr.yml`](https://github.com/notum-cz/strapi-next-monorepo-starter/blob/main/.github/workflows/auto-pr.yml) creates or updates a PR from `dev` to `main` when changes are pushed. It extracts required environment variables from commit messages.

See [Git Hooks and Conventions](./workflow.md#environment-variables-in-commits) for the commit-message format used by `auto-pr.yml`.

## Heroku

Create two Heroku apps: one for Strapi and one for the Next.js UI. Use the `heroku-24` stack, connect both apps to the GitHub repository in the Deploy tab, and configure automatic deploys from your branch.

If you are not deploying to Heroku, remove all `Procfile`s from the repository.

Notum buildpacks are available for smaller and faster monorepo builds:

- `https://github.com/notum-cz/heroku-buildpack-turbo-prune.git`
- `https://github.com/notum-cz/heroku-buildpack-next-standalone-slim.git`

## Strapi App

1. Connect [Heroku Postgres](https://elements.heroku.com/addons/heroku-postgresql). `DATABASE_URL` is set automatically, so you can skip other database-related configuration.
2. Set env variables based on `.env.example`.
3. Set `APP=strapi`.
4. Set `WORKSPACE=@repo/strapi`.
5. Set buildpacks in this order:
   - `https://github.com/notum-cz/heroku-buildpack-turbo-prune.git`
   - `heroku/nodejs`
6. Use S3 or another external upload provider for media. Heroku's filesystem deletes uploaded files after dyno restarts.

## UI App

1. Set env variables based on `.env.example`.
2. Set `APP=ui`.
3. Set `WORKSPACE=@repo/ui`.
4. Set `NEXT_OUTPUT=standalone`.
5. Set buildpacks in this order:
   - `https://github.com/notum-cz/heroku-buildpack-turbo-prune.git`
   - `heroku/nodejs`
   - `https://github.com/notum-cz/heroku-buildpack-next-standalone-slim.git`
