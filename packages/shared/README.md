# Shared Package

Cross-workspace mock data used by the API seed script and as the source of truth for demo credentials across the monorepo.

<p align="center">
  <a href="https://skillicons.dev">
    <img
      src="https://skillicons.dev/icons?i=bun,ts&theme=light&perline=2"
      alt="Shared package tech stack"
    />
  </a>
</p>

## Purpose

This package provides a single source of truth for demo/seed data so the API database and the documented web retrieval credentials stay consistent. It is not a types package — entity types live in each app's own `types/` directory.

## Package configuration

```json
{
  "name": "shared",
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  }
}
```

- No build step — consumed as raw TypeScript via Bun workspace resolution
- Imported as `import { mockAgents } from 'shared'` in `apps/api`; the web app consumes the same seeded records through the API
- Type-checking is covered by the consuming apps' `typecheck` scripts

## Exports

| Export | File | Description |
| --- | --- | --- |
| `mockAgents` | `src/mocks/agents.ts` | 3 sample delivery agents |
| `mockLockers` | `src/mocks/lockers.ts` | 8 lockers across small/medium/large sizes |
| `createMockPackages()` | `src/mocks/packages.ts` | Factory for 2 pre-stored packages with relative timestamps |

### `mockAgents`

```typescript
type MockAgent = {
  agentId: string;   // e.g. "AGT-1001"
  name: string;
  status: "active" | "inactive";
};
```

| Agent ID | Name | Status |
| --- | --- | --- |
| `AGT-1001` | Ali Delivery | active |
| `AGT-1002` | Siti Express | active |
| `AGT-1003` | Kumar Logistics | active |

### `mockLockers`

```typescript
type MockLocker = {
  id: string;              // e.g. "locker_001"
  lockerId: string;        // e.g. "S-01"
  size: "small" | "medium" | "large";
  status: "available" | "occupied" | "maintenance";
  currentPackageId?: string | null;
};
```

8 lockers total:

| Prefix | Size | Count | Example IDs |
| --- | --- | --- | --- |
| `S-*` | small | 3 | `S-01`, `S-02`, `S-03` |
| `M-*` | medium | 3 | `M-01`, `M-02`, `M-03` |
| `L-*` | large | 2 | `L-01`, `L-02` |

`S-02` is pre-occupied with `pkg_existing_001` for customer retrieval testing. `L-02` is in `maintenance` status.

### `createMockPackages(referenceDate?)`

Returns 2 stored packages. Accepts an optional `referenceDate` (defaults to `Date.now()`) to generate relative `droppedOffAt` timestamps:

| Package ID | Agent | Locker | Size | Pickup code | Dropped off |
| --- | --- | --- | --- | --- | --- |
| `pkg_existing_001` | `AGT-1001` | `S-02` | small | `111111` | 6 days ago |
| `pkg_existing_002` | `AGT-1002` | `M-02` | medium | `222222` | 11 days ago |

## Usage

### API (`apps/api`)

`seedDatabaseIfEmpty()` in `apps/api/src/db/seed.ts`:

1. Checks if agents, lockers, or packages collections have any documents.
2. If all are empty, generates fresh `ObjectId`s for each entity.
3. Maps string references (`agentId`, `lockerId`, `currentPackageId`) to ObjectIds.
4. Inserts all documents in parallel via `insertMany`.

Runs automatically in `startServer()` when `NODE_ENV !== "production"`.

### Web (`apps/web`)

The web app no longer looks up customer retrieval packages from local mock state. Instead, it calls the API endpoints backed by the seeded MongoDB data:

- `POST /customer/retrieval/lookup`
- `POST /customer/retrieval/confirm`

Use the credentials above (`S-02 / 111111` or `M-02 / 222222`) after the API seed runs.

## File structure

```
src/
├── index.ts           # Re-exports all mocks
└── mocks/
    ├── agents.ts      # mockAgents array
    ├── lockers.ts     # mockLockers array
    └── packages.ts    # createMockPackages() factory
```

## Quick test reference

| Scenario | Values |
| --- | --- |
| Agent login | `AGT-1001`, `AGT-1002`, or `AGT-1003` |
| Customer retrieval | Locker `S-02`, pickup code `111111` |
| Occupied locker | `S-02` (has `pkg_existing_001`) |
| Available small locker | `S-01`, `S-03` |
