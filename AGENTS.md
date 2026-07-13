# AGENTS.md — My Car Pal Contributor Guide

## Purpose

This file defines durable implementation guardrails for contributors and coding agents working on the public My Car Pal application.

## Product and Architecture

- My Car Pal is an owner-first, privacy-forward vehicle maintenance application for everyday drivers, DIY users, and households.
- The public application must remain self-hostable with Node.js, PostgreSQL, Docker, and local file storage.
- Provider-specific integrations must be optional and isolated behind adapters. Core features must not require a particular hosting, database, storage, billing, or email vendor.
- Do not add hosted-service billing, entitlement, customer-operations, or production deployment logic to the public application.

## Development

```bash
npm ci
npm run db:up
npx prisma migrate dev
npm run dev
```

Before submitting changes, run the checks relevant to the work:

```bash
npm run typecheck
npm run lint
npm test
npm run check:ui-tokens
npm run verify:design-system
```

See `CONTRIBUTING.md` and `SELF_HOSTING.md` for the complete contributor and deployment workflows.

## Implementation Guardrails

- Preserve per-user data isolation in every query, action, upload, and stored-file lookup.
- Treat uploaded documents, receipts, vehicle photos, and profile assets as private user data requiring explicit ownership checks.
- Favor additive, reversible schema evolution and migration-safe defaults.
- Keep forms forgiving, with clear validation and pending, success, no-op, and error feedback.
- Keep shared UI primitives presentational and data-agnostic. Business rules, server actions, authentication checks, and provider adapters stay in the application layer.
- Honor accessible semantics, visible keyboard focus, reduced-motion preferences, responsive layouts, and light/dark themes.
- Keep external integrations transparent, privacy-safe, and inexpensive to operate.
- Never commit secrets or expose private values through `NEXT_PUBLIC_*` variables.

## Documentation

- Update `README.md` when setup, routes, or headline features change.
- Add concise, user-facing changes to `CHANGELOG.md`.
- Update `SELF_HOSTING.md`, `CONTRIBUTING.md`, or `docs/ui-architecture.md` when their documented workflows change.
- Keep internal planning, rejected concepts, private operations, and vendor-specific agent instructions out of the public repository.

## Sources of Truth

- Current product and setup overview: `README.md`
- Release history: `CHANGELOG.md`
- Contributor workflow: `CONTRIBUTING.md`
- Self-hosting: `SELF_HOSTING.md`
- Shared UI architecture: `docs/ui-architecture.md`
