# Smart Package Locker

A package locker management system where delivery agents drop off packages into available lockers and customers retrieve them using a pickup code.

## Monorepo structure

```
smart-package-locker/
├── apps/
│   ├── web/          # React + TypeScript frontend
│   └── api/          # Fastify + TypeScript backend (later)
├── packages/
│   └── shared/       # Shared types and constants
├── package.json      # Bun workspace root
└── README.md
```

## Roadmap

**Phase 1 — Frontend UI**

Build the React UI first: home page, agent drop-off flow, package size and locker selection, drop-off success, and customer retrieval.

**Later phases**

- Fastify API (agent validation, locker availability, drop-off, pickup codes, retrieval)
- MongoDB integration
- Deployment (e.g. Vercel)
