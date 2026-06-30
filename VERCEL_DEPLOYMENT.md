# Vercel Deployment Setup

This repository is set up to deploy `apps/web` and `apps/api` as two separate
Vercel projects from the same monorepo.

## CI Files

- `apps/web/vercel.json`
  - Pins the Bun runtime on Vercel.
  - Restricts automatic Vercel deployments to `main` and `staging`.
  - Rewrites all SPA routes to `index.html` so React Router deep links work.
- `apps/api/vercel.json`
  - Pins the Bun runtime on Vercel for the Fastify API function.
  - Restricts automatic Vercel deployments to `main` and `staging`.
- `.github/workflows/ci.yml`
  - Runs install, lint, typecheck, and build on pull requests and pushes to
    `main` and `staging`.

## Why CD is not in GitHub Actions

This repo uses Bun workspaces and an internal `shared` package. Vercel's native
Git integration is the safer default for this monorepo shape than a custom
Vercel CLI deployment workflow, because:

- each app can be connected as its own Vercel project with its own root
  directory and environment variables
- Vercel automatically understands unchanged monorepo projects when the repo is
  imported correctly
- custom CLI deployments in monorepos are more sensitive to root-directory and
  workspace resolution issues

Use GitHub Actions for CI and Vercel itself for CD.

## Deployment policy

This repo is configured so that:

- `main` deploys to the production environment on Vercel
- `staging` deploys to the staging environment on Vercel
- all other branches remain on GitHub and do not auto-deploy on Vercel

That branch gating is encoded directly in each app's `vercel.json` with:

```json
{
  "git": {
    "deploymentEnabled": {
      "*": false,
      "main": true,
      "staging": true
    }
  }
}
```

## Create the two Vercel projects

Create two separate Vercel projects from the same GitHub repository:

1. Web project
   - Root Directory: `apps/web`
2. API project
   - Root Directory: `apps/api`

Vercel should auto-detect the framework for each app from the selected root
directory.

## Web project settings

Required environment variables:

- `VITE_API_BASE_URL`

Recommended values:

- Production: your deployed API URL, for example
  `https://smart-package-locker-api.vercel.app`
- Staging: your staging API URL, for example
  `https://staging-api.yourdomain.com`

Notes:

- `apps/web/src/api/base-url.ts` throws if `VITE_API_BASE_URL` is missing.
- The SPA rewrite in `apps/web/vercel.json` is required for routes like
  `/agent/id` and `/customer/form`.

## API project settings

Required environment variables:

- `NODE_ENV`
- `HOST`
- `PORT`
- `LOG_LEVEL`
- `CORS_ORIGIN`
- `MONGODB_URI`
- `MONGODB_DB_NAME`
- `MONGODB_SERVER_SELECTION_TIMEOUT_MS`
- `JWT_SECRET`
- `AGENT_JWT_TTL_MINUTES`

Use `apps/api/.env.example` as the source of truth for values and defaults.

Recommended values by environment:

- Production `CORS_ORIGIN`: the deployed web URL, for example
  `https://smart-package-locker-web.vercel.app`
- Staging `CORS_ORIGIN`: the staging web URL, for example
  `https://staging-web.yourdomain.com`

Notes:

- `apps/api/src/plugins/security.plugin.ts` already supports either `*` or a
  comma-separated list of exact origins.
- `apps/api/src/server.ts` only seeds the database when `NODE_ENV` is not
  `production`, so Vercel deployments should use real data or a pre-seeded
  database.

## Git and monorepo settings

After both projects are connected:

1. Keep Git integration enabled on both Vercel projects.
2. Confirm the Root Directory is set correctly for each project.
3. Set the production branch to `main` on both projects.
4. Assign a stable staging domain to the `staging` branch on both projects.
5. Leave Vercel's monorepo skipping enabled so unaffected projects are skipped
   automatically.

## Staging environment wiring

The current web app expects `VITE_API_BASE_URL` as a normal environment
variable. Because this repo only deploys `main` and `staging` on Vercel, the
recommended setup is to wire those explicitly:

- Production web `VITE_API_BASE_URL` -> production API URL
- Staging web `VITE_API_BASE_URL` -> staging API URL
- Production API `CORS_ORIGIN` -> production web URL
- Staging API `CORS_ORIGIN` -> staging web URL

You do not need feature-branch preview URL discovery with this model because
feature branches are intentionally not deployed on Vercel.
