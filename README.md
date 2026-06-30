
<p align="center">
  <img src="./packages/banner.png" alt="Smart Package Locker" width="100%" />
</p>

A package locker management system where delivery agents drop off packages into available lockers and customers retrieve them using a pickup code.

<p align="center">
  <a href="https://skillicons.dev">
    <img
      src="https://skillicons.dev/icons?i=bun,react,ts,vite,mongodb,css,nodejs&theme=light&perline=7"
      alt="Core tech stack"
    />
  </a>
</p>

## Monorepo structure

```
smart-package-locker/
├── apps/
│   ├── web/          # React + Vite frontend
│   └── api/          # Fastify + MongoDB backend
├── packages/
│   └── shared/       # Shared mock data for seeding and local UI state
├── package.json      # Bun workspace root
└── turbo.json        # Turborepo task orchestration
```

| Package | Description |
| --- | --- |
| [`apps/web`](./apps/web) | React UI for agent drop-off and customer retrieval flows |
| [`apps/api`](./apps/api) | Fastify API with JWT auth, locker assignment, and drop-off |
| [`packages/shared`](./packages/shared) | Mock agents, lockers, and packages used by the API seed and web app |

## Tech stack

### Monorepo & runtime

| Technology | Version | Role |
| --- | --- | --- |
| [Bun](https://bun.sh) | 1.0+ | Package manager, runtime, and workspace orchestration |
| [Turborepo](https://turbo.build) | ^2.5 | Task runner for `dev`, `build`, `lint`, and `typecheck` across packages |
| [TypeScript](https://www.typescriptlang.org) | ^5.2 | Shared language across all packages |
| [ESLint](https://eslint.org) | ^8.57 | Linting with `@typescript-eslint` in both apps |

### Frontend (`apps/web`)

| Technology | Version | Role |
| --- | --- | --- |
| [React](https://react.dev) | ^18.2 | UI components and client-side state |
| [Vite](https://vitejs.dev) | ^5.2 | Dev server, HMR, and production bundling |
| [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react) | ^4.2 | Fast Refresh and JSX transform for Vite |
| [React Router](https://reactrouter.com) | ^7.18 | Client-side routing for agent and customer flows |
| Custom CSS | — | Global styles via CSS custom properties in `apps/web/src/styles/global.css` (no Tailwind) |
| Google Fonts | — | [Fredoka](https://fonts.google.com/specimen/Fredoka) (display) and [Nunito](https://fonts.google.com/specimen/Nunito) (body) |

**Web plugins & tooling**

| Package | Purpose |
| --- | --- |
| `eslint-plugin-react-hooks` | Enforces Rules of Hooks |
| `eslint-plugin-react-refresh` | Validates Fast Refresh compatibility in dev |
| `shared` (workspace) | Mock locker/package data for customer retrieval UI |

**Auth on the client:** JWT tokens from the API are stored in `sessionStorage` with expiry checks. Protected agent routes use a `ProtectedAgentRoute` guard.

### Backend (`apps/api`)

| Technology | Version | Role |
| --- | --- | --- |
| [Fastify](https://fastify.dev) | ^5.9 | HTTP server framework |
| [MongoDB](https://www.mongodb.com) | 6.21 | Document database for agents, lockers, and packages |
| [Zod](https://zod.dev) | ^4.4 | Runtime schema validation for env, requests, and responses |
| [fastify-type-provider-zod](https://github.com/turkerdev/fastify-type-provider-zod) | ^7.0 | Wires Zod schemas into Fastify route validation and serialization |
| [tsc-alias](https://github.com/justkey007/tsc-alias) | ^1.8 | Resolves `@/` path aliases in compiled `dist/` output |

**Fastify plugins**

| Plugin | Package | Purpose |
| --- | --- | --- |
| Env decorator | `env.plugin.ts` | Attaches validated `Env` config to `app.config` |
| CORS | `@fastify/cors` ^11.2 | Cross-origin access for the Vite dev server and production frontend |
| Helmet | `@fastify/helmet` ^13.0 | Security headers (XSS, clickjacking, MIME sniffing, etc.) |
| JWT | `@fastify/jwt` ^10.1 | Signs and verifies agent bearer tokens |
| Decorators | `decorators.plugin.ts` | Exposes `app.mongo` (DB client) and `app.authenticate` (JWT verify) |

**Auth flow:** Agents authenticate via `POST /auth/agent/login`. Drop-off routes use the `authenticate` pre-handler, which calls `request.jwtVerify()`. Tokens carry `sub` (agent ID) and `role: "agent"`, with TTL controlled by `AGENT_JWT_TTL_MINUTES`.

**Validation flow:** Route schemas in `src/schemas/` are registered per-endpoint. The global error handler normalizes `AppError`, Zod validation errors, and Fastify serialization errors into a consistent `{ error: { code, message } }` response shape.

### Shared (`packages/shared`)

| Export | Used by |
| --- | --- |
| `mockAgents` | API seed script, web flow state |
| `mockLockers` | API seed script, web locker station UI |
| `createMockPackages()` | API seed script, web customer retrieval lookup |

Consumed as raw TypeScript via Bun workspace exports — no separate build step.

## Prerequisites

- [Bun](https://bun.sh) 1.0+
- [MongoDB](https://www.mongodb.com/) running locally or accessible via connection string

## Getting started

1. Install dependencies from the repository root:

   ```bash
   bun install
   ```

2. Configure environment files:

   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   ```

   Update `apps/api/.env` with your MongoDB URI and a strong `JWT_SECRET`.

3. Start both apps:

   ```bash
   bun run dev
   ```

   | Service | URL |
   | --- | --- |
   | Web (Vite) | http://localhost:5173 |
   | API (Fastify) | http://localhost:3001 |

   On first startup in development, the API seeds the database with mock data when all collections are empty.

## Root scripts

Turborepo runs these across all workspace packages:

| Command | Description |
| --- | --- |
| `bun run dev` | Start all apps in watch mode (Vite HMR + Bun `--watch`) |
| `bun run build` | Type-check and build all packages (`tsc` + `tsc-alias` for API, `vite build` for web) |
| `bun run lint` | ESLint across all packages |
| `bun run typecheck` | `tsc --noEmit` across all packages |

Run a single app from its directory:

```bash
cd apps/api && bun run dev
cd apps/web && bun run dev
```

## User flows

### Agent drop-off

1. Enter an agent ID (try `AGT-1001` from the seed data).
2. Select a package size (`small`, `medium`, or `large`).
3. Review the API-recommended locker and confirm drop-off.
4. Receive a pickup code on the success screen.

The agent flow calls `POST /auth/agent/login` for a JWT, then `GET /agent/dropoff/lockers` and `POST /agent/dropoff`. Drop-offs are persisted to MongoDB with atomic locker reservation.

### Customer retrieval

1. Enter locker ID and pickup code.
2. Review package details and any storage charges.
3. Confirm retrieval.

The customer flow currently runs against in-memory mock package data in the web app. API-backed retrieval is planned for a later phase.

**Quick test credentials**

| Flow | Credential |
| --- | --- |
| Agent login | `AGT-1001`, `AGT-1002`, or `AGT-1003` |
| Customer retrieval | Locker `S-02`, pickup code `111111` |

## Architecture overview

```
┌─────────────┐     JWT + REST      ┌─────────────┐     MongoDB     ┌──────────┐
│  apps/web   │ ──────────────────► │  apps/api   │ ──────────────► │ Database │
│ React/Vite  │                     │   Fastify   │                 │          │
└─────────────┘                     └─────────────┘                 └──────────┘
       │                                   │
       └──────── shared (mock data) ───────┘
```

## Further reading

- [Web app README](./apps/web/README.md) — routes, styling, client auth, and API integration
- [API README](./apps/api/README.md) — plugins, endpoints, schemas, and locker assignment rules
- [Shared package README](./packages/shared/README.md) — mock data reference and seed behavior
