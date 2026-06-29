# API

Fastify + Bun backend for the Smart Package Locker system.

## Current scope

Phase 1 provides the production-ready scaffold for:

- Fastify application bootstrap
- Environment validation
- MongoDB connection lifecycle
- JWT-based agent authentication
- Health and readiness endpoints
- Structured error handling

Business flow endpoints for drop-off, locker assignment, and retrieval will be
added in the next phase.

## Environment

Copy `apps/api/.env.example` into `.env` and provide real values for:

- `MONGODB_URI`
- `MONGODB_DB_NAME`
- `JWT_SECRET`

The scaffold defaults to `PORT=3001` and `CORS_ORIGIN=http://localhost:5173`.

## Commands

From the repository root:

- `bun run dev`
- `bun run build`
- `bun run lint`
- `bun run typecheck`

To run only the API app:

- `cd apps/api && bun run dev`
- `cd apps/api && bun run build`

## Endpoints

- `GET /health` - liveness check
- `GET /ready` - MongoDB readiness check
- `POST /auth/agent/login` - validate an agent and issue a JWT session

### `POST /auth/agent/login`

Request body:

```json
{
  "agentId": "AGT-1001"
}
```

Successful response:

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
