# Web App

React + TypeScript frontend for the Smart Package Locker system.

<p align="center">
  <a href="https://skillicons.dev">
    <img
      src="https://skillicons.dev/icons?i=react,vite,ts,css&theme=light&perline=4"
      alt="Web app tech stack"
    />
  </a>
</p>

## Features

- Home page with entry points for agent and customer flows
- Agent drop-off: ID login, package size selection, locker assignment, success screen
- Agent success: email pickup details to the customer (`POST /agent/dropoff/email`)
- Agent success: adjust drop-off timestamp (1/6/11 days ago presets) for storage-charge demos (`POST /agent/dropoff/dropped-off-at`)
- Customer retrieval: locker/pickup code lookup, charge review, confirmation, success screen
- JWT session storage with expiry for authenticated agent routes
- Locker station visualization with status legend
- Custom CSS design system with CSS custom properties (no Tailwind or component library)

## Dependencies

### Runtime

| Package | Version | Purpose |
| --- | --- | --- |
| `react` | ^18.2 | UI rendering and hooks |
| `react-dom` | ^18.2 | DOM mounting |
| `react-router-dom` | ^7.18 | Declarative routing with nested routes and redirects |

### Dev & build

| Package | Version | Purpose |
| --- | --- | --- |
| `vite` | ^5.2 | Dev server with HMR, production bundler |
| `@vitejs/plugin-react` | ^4.2 | React Fast Refresh, automatic JSX runtime |
| `typescript` | ^5.2 | Static typing |
| `eslint` | ^8.57 | Linting |
| `eslint-plugin-react-hooks` | ^4.6 | Rules of Hooks enforcement |
| `eslint-plugin-react-refresh` | ^0.4.6 | Fast Refresh export validation |
| `@typescript-eslint/eslint-plugin` | ^7.1 | TypeScript-aware lint rules |
| `@typescript-eslint/parser` | ^7.1 | TypeScript parser for ESLint |

## Vite configuration

`vite.config.ts` uses the React plugin and a `@` path alias to `src/`:

```typescript
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

- Dev server: `bunx vite` → http://localhost:5173
- Production build: `tsc` (type-check) then `vite build` → `dist/`
- Preview: `bunx vite preview`

## Styling

The app uses **custom CSS**, not Tailwind or a UI framework.

| Asset | Location | Details |
| --- | --- | --- |
| Global styles | `src/styles/global.css` | ~1100 lines of component and layout styles |
| Design tokens | `:root` CSS variables | Colors, shadows, border radii, font families |
| Fonts | `index.html` | [Fredoka](https://fonts.google.com/specimen/Fredoka) (headings) and [Nunito](https://fonts.google.com/specimen/Nunito) (body) via Google Fonts |
| Theme color | `index.html` | `#ffc933` (warm yellow accent) |
| Favicon | `public/box-logo.png` | Package box icon |

Key CSS variables:

```css
--primary-color: #ffc933;
--bg-color: #fff6d8;
--font-display: "Fredoka", ...;
--font-body: "Nunito", ...;
--radius-lg: 32px;
```

## Environment

Copy `.env.example` to `.env`:

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Yes | Base URL for all API calls (read in `src/lib/api/base-url.ts`; throws if unset) |

The API must be running for both the agent drop-off and customer retrieval flows. See the [root README](../../README.md) and [API README](../api/README.md) for backend setup.

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
bun run dev       # Vite dev server on http://localhost:5173
bun run build     # tsc + vite build → dist/
bun run preview   # Preview the production build
```

## Routes

Defined in `src/router/AppRouter.tsx`:

| Path | Page | Auth required |
| --- | --- | --- |
| `/` | `HomePage` | No |
| `/agent/id` | `AgentIdPage` | No |
| `/agent/size` | `AgentPackageSizePage` | Yes |
| `/agent/locker` | `AgentLockerAssignmentPage` | Yes |
| `/agent/success` | `AgentSuccessPage` | Yes |
| `/customer/form` | `CustomerRetrievalFormPage` | No |
| `/customer/confirm` | `CustomerRetrievalConfirmPage` | No |
| `/customer/success` | `CustomerRetrievalSuccessPage` | No |

`/agent` and `/customer` index routes redirect to their first step. Unknown paths redirect to `/`.

Protected agent routes are wrapped by `ProtectedAgentRoute`, which checks for a valid JWT session and redirects to `/agent/id` if missing or expired.

## Project layout

```
src/
├── lib/api/                 # Typed API clients + requestJson helper
│   ├── agent-auth/
│   │   ├── api.ts           # POST /auth/agent/login client
│   │   └── session.ts       # sessionStorage JWT helpers
│   ├── agent-dropoff/
│   │   └── api.ts           # Locker availability, drop-off, email, time update
│   ├── customer-retrieval/
│   │   └── api.ts           # Retrieval lookup + confirm clients
│   ├── base-url.ts          # VITE_API_BASE_URL resolver
│   ├── client.ts            # requestJson + network error handling
│   └── errors.ts            # ApiError base class
├── feature/                 # Feature UI + auth guard
│   ├── agent-auth/
│   │   └── ProtectedAgentRoute.tsx
│   ├── agent-dropoff/
│   │   ├── AgentIdStep.tsx
│   │   ├── PackageSizeStep.tsx
│   │   ├── AutoLockerAssignmentStep.tsx
│   │   └── DropOffSuccessStep.tsx
│   ├── customer-retrieval/
│   │   ├── RetrievalFormStep.tsx
│   │   ├── RetrievalConfirmStep.tsx
│   │   └── RetrievalSuccessStep.tsx
│   └── locker-station/
│       ├── LockerStation.tsx
│       ├── LockerCard.tsx
│       └── LockerLegend.tsx
├── components/
│   ├── AppShell.tsx
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── ErrorMessage.tsx
│   ├── StepHeader.tsx
│   └── SuccessPanel.tsx
├── pages/                   # Thin route wrappers
├── router/
│   └── AppRouter.tsx
├── state/
│   ├── FlowStateContext.tsx
│   ├── flowState.ts
│   └── useFlowState.ts
├── styles/
│   └── global.css
├── types/
└── utils/
    ├── lockerRules.ts
    ├── pickupCode.ts
    └── storageCharges.ts
```

## State management

`FlowStateProvider` (`src/state/FlowStateContext.tsx`) holds:

| State | Source | Used by |
| --- | --- | --- |
| `selectedAgent` | API login response | Agent flow steps |
| `selectedPackageSize` | User selection | Locker recommendation query |
| `latestDropOffPackage` | API drop-off response | Success screen |
| `retrievalPackage` | Retrieval lookup / confirm responses | Confirm + success screens |
| `retrievalChargePreview` | Retrieval lookup response | Customer confirm screen |

Both agent drop-off and customer retrieval call the API. Flow state only keeps the selected package/session context between pages.

## Agent flow (API-integrated)

```
/agent/id → POST /auth/agent/login → sessionStorage
    ↓
/agent/size → select package size
    ↓
/agent/locker → GET /agent/dropoff/lockers?packageSize=...
              → POST /agent/dropoff
    ↓
/agent/success → display pickup code
              → optional POST /agent/dropoff/email
              → optional POST /agent/dropoff/dropped-off-at
```

1. User enters an agent ID on `/agent/id`.
2. `loginAgent()` calls `POST /auth/agent/login` and stores `{ token, expiresAt, agent }` in `sessionStorage`.
3. `ProtectedAgentRoute` blocks `/agent/size`, `/agent/locker`, and `/agent/success` without a valid session.
4. Locker page fetches availability and confirms drop-off via the API clients in `src/lib/api/agent-dropoff/api.ts`.
5. Success screen can email pickup details or adjust the drop-off timestamp for storage-charge testing.
6. `AgentDropoffApiError` surfaces API error codes (e.g. `LOCKER_UNAVAILABLE`) to the UI.

Try agent IDs: `AGT-1001`, `AGT-1002`, or `AGT-1003`.

## Customer flow (API-integrated)

```
/customer/form → POST /customer/retrieval/lookup
    ↓
/customer/confirm → review server-calculated charge preview
    ↓
/customer/confirm → POST /customer/retrieval/confirm
    ↓
/customer/success → display confirmed retrieval details
```

The customer flow validates locker credentials against the API, renders a server-calculated charge preview, and confirms retrieval with a second API call that marks the package as retrieved and frees the locker.

**Test credentials:** locker `S-02`, pickup code `111111` or locker `M-02`, pickup code `222222`.

## API client pattern

All API calls go through typed clients in `src/lib/api/`. Shared helpers live in `client.ts` and `errors.ts`:

```typescript
// base-url.ts — required at build/runtime
export function getApiBaseUrl() {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  if (!apiBaseUrl) {
    throw new Error("VITE_API_BASE_URL is not configured.");
  }
  return apiBaseUrl.replace(/\/+$/, "");
}

// client.ts — wraps fetch with typed error mapping
export async function requestJson<T>(
  url: string,
  init: RequestInit,
  mapError: MapApiError,
): Promise<T> { /* ... */ }
```

Errors are parsed from `{ error: { code, message } }` and thrown as typed client errors such as `AgentDropoffApiError` and `CustomerRetrievalApiError`.
