# Data Seeding and Imports

Strapi seed exports keep local development databases aligned with the content shape expected by the frontend.

## How It Works

Seed exports live in the Strapi app:

```text
apps/strapi/seed/exports/strapi-export-YYYY-MM-DD-HHmmss.tar.gz
```

The newest timestamped export is treated as the current seed. There is no separate promotion step.

When Strapi starts through the default scripts, `scripts/seed-runner.mjs` can run before the Strapi server starts:

1. Load `.env`.
2. Run `scripts/seed-check.mjs`.
3. Load a Strapi instance without starting the HTTP server.
4. Check whether baseline content exists through the Documents API:
   - `Page`
   - `Navbar`
   - `Footer`
5. If required content is missing, run `scripts/seed-import.sh`.
6. Import the latest timestamped export.
7. Start Strapi normally.

## Commands

Run commands from `apps/strapi`.

Seed import and export scripts require `bash`. On Windows, use WSL, Git Bash, or another shell with Bash available.

```bash
pnpm run seed:check   # Check whether Page, Navbar, and Footer content exists
pnpm run seed:import  # Import the latest timestamped seed export
pnpm run seed:export  # Create a new timestamped seed export
```

`seed:export` keeps only the latest 5 exports.

## Auto Seed Configuration

Automatic seeding is controlled by:

```bash
AUTO_SEED_ENABLED=true
AUTO_SEED_MODE=empty
```

`AUTO_SEED_ENABLED` defaults to `true` for `strapi develop` and `false` for `strapi start` when the variable is not set.

Available modes:

- `empty` - import the latest seed export only when page, navbar, or footer content is missing
- `prompt` - ask before importing or overwriting content in an interactive terminal
- `force` - always import the latest seed export; this overwrites existing data
- `skip` - never import

For deployed environments, usually keep `AUTO_SEED_ENABLED=false` unless the environment should self-initialize (`empty` mode) or refilled (`force` mode).

## Local Development Workflow

For normal development, start Strapi with `dev` script.

On startup, Strapi imports the newest seed export if baseline content is missing. This gives new developers a working local database without manual content setup.

## PR Workflow

When a PR creates or changes Strapi collections, components, single types, or content that other developers need locally:

1. Make the schema or content changes in Strapi.

2. Export the updated seed:

   ```bash
   cd apps/strapi
   pnpm run seed:export
   ```

3. Commit the new `seed/exports/strapi-export-YYYY-MM-DD-HHmmss.tar.gz`.
4. Open the PR with the schema/type/content changes and the new seed export together.

Other developers will pick up the new export when they pull the branch. On the next Strapi start, their local database will be seeded automatically if baseline content is missing. If they already have local content and need to apply the new export, they can run:

```bash
cd apps/strapi
pnpm run seed:import
```

Or they can start Strapi with `AUTO_SEED_MODE=force` to automatically import the new seed on startup.

Importing a Strapi export **overwrites existing data**, so developers should export or otherwise preserve local work before importing over it.

## First Run Without Seed

If no seed export exists, create the baseline content manually in Strapi:

- Create one page in `Page` collection with `fullPath` and `slug` set to `/`
- Create `Navbar` single type content
- Create `Footer` single type content

The frontend supports `en` and `cs` by default, so enable both locales in Strapi and create localized content for both.
