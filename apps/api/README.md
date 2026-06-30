# API

Fastify + Bun backend for the Smart Package Locker system.

<p align="center">
  <img src="https://img.shields.io/badge/Fastify-000000?style=for-the-badge&logo=fastify&logoColor=white" alt="Fastify" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white" alt="Zod" />
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT" />
  <img src="https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white" alt="Bun" />
</p>

## Features

- Fastify 5 server with structured logging
- Zod request/response validation via `fastify-type-provider-zod`
- Environment validation on startup (Zod schema in `config/env.config.ts`)
- MongoDB connection lifecycle with health/readiness checks
- JWT-based agent authentication (`@fastify/jwt`)
- Agent drop-off: locker availability, recommendation, and package creation
- Automatic mock data seeding in non-production when the database is empty
- Structured error handling with consistent API error responses
- Security headers via `@fastify/helmet` and CORS via `@fastify/cors`

## Dependencies

### Runtime

| Package | Version | Purpose |
| --- | --- | --- |
| `fastify` | ^5.9 | HTTP server, routing, hooks, and logging |
| `@fastify/cors` | ^11.2 | Cross-origin resource sharing for the web frontend |
| `@fastify/helmet` | ^13.0 | Sets security-related HTTP headers |
| `@fastify/jwt` | ^10.1 | JWT signing (`reply.jwtSign`) and verification (`request.jwtVerify`) |
| `fastify-type-provider-zod` | ^7.0 | Compiles Zod schemas into Fastify validators and serializers |
| `zod` | ^4.4 | Schema definitions for env, requests, and responses |
| `mongodb` | 6.21 | Official MongoDB driver with Server API v1 |
| `shared` | workspace | Mock seed data (agents, lockers, packages) |

### Dev

| Package | Version | Purpose |
| --- | --- | --- |
| `typescript` | ^5.2 | Static typing |
| `tsc-alias` | ^1.8 | Rewrites `@/` path aliases after `tsc` compile |
| `eslint` + `@typescript-eslint/*` | ^8 / ^7 | Linting |

## Plugins

Plugins are registered in `src/plugins/index.ts` via `registerAllPlugins()`:

```
registerEnvPlugin → registerSecurityPlugins → registerJwtPlugin → registerDecorators
```

### `env.plugin.ts`

Decorates the Fastify instance with the validated `Env` object as `app.config`. All other plugins and routes read config from this decorator (port, JWT secret, CORS origin, MongoDB URI, etc.).

### `security.plugin.ts`

Registers two security plugins:

| Plugin | Configuration |
| --- | --- |
| `@fastify/cors` | Origin from `CORS_ORIGIN` env (supports comma-separated list or `*`), allows `Authorization` and `Content-Type` headers, permits `GET/POST/PATCH/PUT/DELETE/OPTIONS` |
| `@fastify/helmet` | Default security headers (Content-Security-Policy, X-Frame-Options, etc.) |

### `jwt.plugin.ts`

Registers `@fastify/jwt` with `secret: app.config.JWT_SECRET`.

Used by:
- `loginAgentController` — signs tokens with `{ sub: agentId, role: "agent" }` and `expiresIn` from `AGENT_JWT_TTL_MINUTES`
- `authenticate` middleware — calls `request.jwtVerify()` on protected routes
- Controllers — read `request.user.sub` for the authenticated agent ID

### `decorators.plugin.ts`

Attaches shared runtime dependencies to the Fastify instance:

| Decorator | Value |
| --- | --- |
| `app.mongo` | `{ client, db, ping }` from the singleton MongoDB connection |
| `app.authenticate` | Async function that verifies the JWT on incoming requests |

## Middleware

| File | Role |
| --- | --- |
| `middleware/auth.middleware.ts` | `authenticate` pre-handler — delegates to `app.authenticate` |
| `middleware/error-handler.middleware.ts` | Global error handler — normalizes `AppError`, `ZodError`, Fastify Zod validation errors, response serialization errors, and unknown errors into `{ error: { code, message } }` |

## Validation

Every route declares Zod schemas in its `schema` block. The server sets:

```typescript
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
```

Schemas live in `src/schemas/`:

| Directory | Contents |
| --- | --- |
| `schemas/auth/` | Agent login request/response |
| `schemas/agent-dropoff/` | Locker query, drop-off request/response, public locker and package shapes |
| `schemas/system/` | Health and readiness responses |
| `schemas/shared/` | Shared `apiErrorResponseSchema` |

## Environment

Copy `.env.example` to `.env` and provide real values:

| Variable | Default | Description |
| --- | --- | --- |
| `NODE_ENV` | `development` | Controls seed behavior (`seedDatabaseIfEmpty` runs when not `production`) |
| `HOST` | `0.0.0.0` | Bind address |
| `PORT` | `3001` | HTTP port |
| `LOG_LEVEL` | `info` | Fastify logger level |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed frontend origin(s) |
| `MONGODB_URI` | — | MongoDB connection string (required) |
| `MONGODB_DB_NAME` | — | Database name (required) |
| `MONGODB_SERVER_SELECTION_TIMEOUT_MS` | `5000` | Connection timeout |
| `JWT_SECRET` | — | Secret for signing agent JWTs (required, min 32 chars) |
| `AGENT_JWT_TTL_MINUTES` | `15` | Token lifetime in minutes |

## Commands

From the repository root:

```bash
bun run dev
bun run build
bun run lint
bun run typecheck
```

From this directory:

```bash
bun run dev      # bun --watch src/server.ts
bun run build    # tsc + tsc-alias → dist/
bun run start    # bun dist/server.js
```

## Project layout

```
src/
├── config/
│   ├── env.config.ts     # Zod env schema + loadEnv()
│   ├── db.config.ts      # connect / disconnect / ping singleton
│   └── index.ts
├── controllers/
│   ├── auth.controller.ts          # Agent login
│   ├── agent-dropoff.controller.ts # Locker availability + drop-off
│   └── system.controller.ts        # Health + readiness
├── db/
│   ├── client.ts         # MongoClient setup, indexes, ping
│   └── seed.ts           # seedDatabaseIfEmpty() from shared mocks
├── errors/
│   └── app-error.ts      # Typed application errors with code + statusCode
├── middleware/
│   ├── auth.middleware.ts
│   └── error-handler.middleware.ts
├── models/
│   ├── agent.model.ts    # agents collection + indexes
│   ├── locker.model.ts   # lockers collection + availability index
│   ├── package.model.ts  # packages collection + lookup indexes
│   └── index.ts
├── plugins/
│   ├── env.plugin.ts
│   ├── security.plugin.ts    # CORS + Helmet
│   ├── jwt.plugin.ts
│   ├── decorators.plugin.ts  # mongo + authenticate
│   └── index.ts
├── routes/
│   ├── auth.route.ts
│   ├── agent-dropoff.route.ts
│   ├── system.route.ts
│   └── index.ts
├── schemas/              # Zod request/response schemas per domain
├── types/
│   ├── entities.ts       # MongoDB document shapes
│   ├── enum.ts           # LOCKER_STATUS, PACKAGE_SIZE, etc.
│   ├── auth.ts           # JWT payload types
│   └── fastify.d.ts      # Module augmentation for decorators
├── utils/
│   ├── locker.util.ts          # Size-fit logic + smallest-locker recommendation
│   ├── pickup-code.util.ts     # Unique 6-digit code generation
│   ├── agent-dropoff.util.ts   # Entity → API response mappers
│   └── auth.util.ts            # Agent entity → public agent
└── server.ts             # buildServer() + startServer() entry point
```

## Endpoints

### System

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/health` | — | Liveness check |
| `GET` | `/ready` | — | MongoDB ping readiness check |

### Auth

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/auth/agent/login` | — | Validate an agent and issue a JWT |

**Request:**

```json
{
  "agentId": "AGT-1001"
}
```

**Response (`200`):**

```json
{
  "token": "<jwt>",
  "expiresAt": "2026-01-01T00:15:00.000Z",
  "agent": {
    "agentId": "AGT-1001",
    "name": "Ali Delivery",
    "status": "active"
  }
}
```

**Error codes:** `AGENT_NOT_FOUND` (404), `AGENT_INACTIVE` (403)

### Agent drop-off

All drop-off routes require `Authorization: Bearer <token>`.

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/agent/dropoff/lockers?packageSize=small` | List all lockers and the recommended assignment |
| `POST` | `/agent/dropoff` | Confirm drop-off, reserve locker, create package |

**`GET /agent/dropoff/lockers` response (`200`):**

```json
{
  "lockers": [
    {
      "id": "...",
      "lockerId": "S-01",
      "size": "small",
      "status": "available"
    }
  ],
  "recommendedLocker": {
    "id": "...",
    "lockerId": "S-01",
    "size": "small",
    "status": "available"
  }
}
```

**`POST /agent/dropoff` request:**

```json
{
  "packageSize": "small",
  "lockerId": "S-01"
}
```

**`POST /agent/dropoff` response (`201`):**

```json
{
  "package": {
    "packageId": "pkg_...",
    "agentId": "AGT-1001",
    "lockerId": "S-01",
    "packageSize": "small",
    "pickupCode": "123456",
    "status": "stored",
    "droppedOffAt": "2026-01-01T00:00:00.000Z"
  },
  "locker": {
    "id": "...",
    "lockerId": "S-01",
    "size": "small",
    "status": "occupied",
    "currentPackageId": "..."
  }
}
```

**Drop-off error codes:**

| Code | Status | When |
| --- | --- | --- |
| `NO_SUITABLE_LOCKER` | 409 | No available locker fits the package size |
| `LOCKER_RECOMMENDATION_CHANGED` | 409 | Client locker ID doesn't match current recommendation |
| `LOCKER_SIZE_MISMATCH` | 400 | Package doesn't fit the selected locker |
| `LOCKER_UNAVAILABLE` | 409 | Locker was taken between recommendation and confirmation |
| `AUTHENTICATED_AGENT_NOT_FOUND` | 401 | JWT valid but agent no longer in database |

### Locker assignment rules

- Size ranking: `small` (1) < `medium` (2) < `large` (3).
- A package fits when `locker.size >= package.size`.
- Recommendation picks the smallest available compatible locker, breaking ties by `lockerId`.
- Drop-off uses `findOneAndUpdate` with `status: available` for atomic reservation; package insert failure rolls back the locker.

## Seed data

In non-production environments, `startServer()` calls `seedDatabaseIfEmpty()` when agents, lockers, and packages collections are all empty. Data comes from the `shared` workspace package with resolved MongoDB `ObjectId` references.

Use agent IDs `AGT-1001`, `AGT-1002`, or `AGT-1003` to log in after a fresh seed.
